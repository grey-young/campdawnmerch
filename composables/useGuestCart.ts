// Guest cart stored in localStorage so visitors can add and view a cart
// without an account. Uses the same key/shape the checkout page already reads
// ("campdawn_guest_cart" -> [{ variant_id, quantity }]). When a guest logs in,
// call mergeIntoAccount() to move these items into their Supabase cart.
const KEY = "campdawn_guest_cart";

export const useGuestCart = () => {
  const hasStorage = () => typeof localStorage !== "undefined";

  const read = () => {
    if (!hasStorage()) return [];
    try {
      const items = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  };

  const write = (items) => {
    if (!hasStorage()) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  };

  const count = () =>
    read().reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  // Add a variant, merging with any existing quantity and clamping to stock.
  const add = (variantId, quantity, stock = 0) => {
    const items = read();
    const existing = items.find((item) => item.variant_id === variantId);
    const requested = Number(quantity) || 0;

    if (existing) {
      const next = Number(existing.quantity || 0) + requested;
      existing.quantity = stock > 0 ? Math.min(next, stock) : next;
    } else {
      items.push({
        variant_id: variantId,
        quantity: stock > 0 ? Math.min(requested, stock) : requested,
      });
    }

    write(items);
    return items;
  };

  const setQuantity = (variantId, quantity) => {
    const items = read().map((item) =>
      item.variant_id === variantId
        ? { ...item, quantity: Number(quantity) }
        : item,
    );
    write(items);
    return items;
  };

  const remove = (variantId) => {
    const items = read().filter((item) => item.variant_id !== variantId);
    write(items);
    return items;
  };

  const clear = () => write([]);

  // Move guest items into the signed-in user's Supabase cart, then clear them.
  // Non-fatal: on any error the guest cart is kept so nothing is lost.
  const mergeIntoAccount = async (supabase, userId) => {
    const items = read();
    if (!items.length) return;

    try {
      let cartId;

      const { data: existingCart } = await supabase
        .from("merch_carts")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingCart) {
        cartId = existingCart.id;
      } else {
        const { data: newCart, error } = await supabase
          .from("merch_carts")
          .insert({ user_id: userId })
          .select("id")
          .single();

        if (error) throw error;
        cartId = newCart.id;
      }

      for (const guestItem of items) {
        const { data: variant } = await supabase
          .from("merch_product_variants")
          .select("id, stock, is_active")
          .eq("id", guestItem.variant_id)
          .maybeSingle();

        if (!variant || !variant.is_active) continue;

        const { data: existingItem } = await supabase
          .from("merch_cart_items")
          .select("id, quantity")
          .eq("cart_id", cartId)
          .eq("variant_id", guestItem.variant_id)
          .maybeSingle();

        if (existingItem) {
          const merged = Math.min(
            Number(existingItem.quantity || 0) + Number(guestItem.quantity || 0),
            variant.stock,
          );

          await supabase
            .from("merch_cart_items")
            .update({ quantity: merged })
            .eq("id", existingItem.id);
        } else {
          const quantity = Math.min(Number(guestItem.quantity || 0), variant.stock);
          if (quantity < 1) continue;

          await supabase
            .from("merch_cart_items")
            .insert({
              cart_id: cartId,
              variant_id: guestItem.variant_id,
              quantity,
            });
        }
      }

      clear();
    } catch (error) {
      console.error("Guest cart merge failed:", error.message);
    }
  };

  return { read, write, count, add, setQuantity, remove, clear, mergeIntoAccount };
};
