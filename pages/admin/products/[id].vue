<template>
  <section class="edit-product-page">
    <div class="page-head" ref="pageHead">
      <div>
        <p class="eyebrow">EDIT MERCH</p>
        <h1>Edit Product</h1>
        <span>Update product info, image, color, size and stock.</span>
      </div>

      <nuxt-link to="/admin/products" class="back-btn">
        Back to Products
      </nuxt-link>
    </div>

    <div v-if="loading" class="loading">Loading product...</div>

    <form v-else class="product-form" @submit.prevent="updateProduct">
      <div class="form-card" ref="card">
        <div class="card-title">
          <h2>Product Details</h2>
          <p>Edit main product information.</p>
        </div>

        <div class="grid">
          <div class="form-group full">
            <label>Product Name</label>
            <input v-model="form.name" type="text" />
          </div>

          <div class="form-group full">
            <label>Slug</label>
            <input v-model="form.slug" type="text" />
          </div>

          <div class="form-group full">
            <label>Description</label>
            <textarea v-model="form.description"></textarea>
          </div>

          <div class="form-group">
            <label>Category</label>
            <select v-model="form.category_id">
              <option value="">No Category</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div class="form-group">
            <label>Price GH₵</label>
            <input v-model.number="form.price" type="number" min="0" />
          </div>

          <div class="form-group">
            <label>Compare Price GH₵</label>
            <input
              v-model.number="form.compare_at_price"
              type="number"
              min="0"
            />
          </div>

          <div class="form-group toggle-group">
            <label>Featured Product</label>
            <button
              type="button"
              class="toggle-btn"
              :class="{ active: form.is_featured }"
              @click="form.is_featured = !form.is_featured"
            >
              {{ form.is_featured ? "Featured" : "Not Featured" }}
            </button>
          </div>
        </div>
      </div>

      <div class="form-card" ref="card">
        <div class="card-title">
          <h2>Product Images</h2>
          <p>Add multiple images. Choose one as the main product image.</p>
        </div>

        <div class="upload-box" @click="$refs.imageInput.click()">
          <input
            ref="imageInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            @change="handleImages"
          />

          <div class="upload-empty">
            <div class="upload-icon">+</div>
            <strong>Click to upload images</strong>
            <p>PNG, JPG or WEBP. You can select many images.</p>
          </div>
        </div>

        <div v-if="images.length" class="preview-grid">
          <div
            v-for="(image, index) in images"
            :key="image.key"
            class="preview-card"
            :class="{ main: image.is_main }"
          >
            <img :src="image.url" alt="Product preview" />

            <div class="preview-actions">
              <button type="button" @click="setMainImage(index)">
                {{ image.is_main ? "Main Image" : "Set Main" }}
              </button>

              <button type="button" class="danger" @click="removeImage(index)">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-card" ref="card">
        <div class="variant-head">
          <div>
            <h2>Stock Variants</h2>
            <p>Edit color, size and stock for each product variant.</p>
          </div>

          <button type="button" @click="addVariant">Add Variant</button>
        </div>

        <div class="variants">
          <div
            v-for="(variant, index) in variants"
            :key="variant.key"
            class="variant-row"
            ref="variantRows"
          >
            <div class="variant-number">
              {{ index + 1 }}
            </div>

            <div class="form-group">
              <label>Color</label>
              <input v-model="variant.color" type="text" placeholder="Black" />
            </div>

            <div class="form-group">
              <label>Size</label>
              <select v-model="variant.size">
                <option value="">Select Size</option>
                <option>XS</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
                <option>XXL</option>
              </select>
            </div>

            <div class="form-group">
              <label>Stock</label>
              <input v-model.number="variant.stock" type="number" min="0" />
            </div>

            <div class="form-group">
              <label>SKU</label>
              <input v-model="variant.sku" type="text" placeholder="CD-BLK-M" />
            </div>

            <button
              v-if="variants.length > 1"
              type="button"
              class="remove"
              @click="removeVariant(index)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>

      <div class="actions" ref="actions">
        <button type="button" class="delete" @click="deleteProduct">
          Delete Product
        </button>

        <div>
          <button
            type="button"
            class="cancel"
            @click="$router.push('/admin/products')"
          >
            Cancel
          </button>

          <button type="submit" class="submit" :disabled="saving">
            {{ saving ? "Saving Changes..." : "Save Changes" }}
          </button>
        </div>
      </div>
    </form>
  </section>
</template>

<script>
export default {
  name: "EditMerchProductPage",

  data() {
    return {
      loading: true,
      saving: false,
      errorMessage: "",
      successMessage: "",
      categories: [],
      productId: "",
      images: [],
      deletedImageIds: [],

      form: {
        name: "",
        slug: "",
        description: "",
        category_id: "",
        status: "draft",
        price: 0,
        compare_at_price: 0,
        is_featured: false,
      },

      variants: [],
      deletedVariantIds: [],
    };
  },

  async mounted() {
    this.productId = this.$route.params.id;

    await this.getCategories();
    await this.getProduct();

    this.$nextTick(() => {
      this.runPageAnimations();
    });
  },

  methods: {
    runPageAnimations() {
      if (!this.$gsap) return;

      this.$gsap.from(this.$refs.pageHead, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.card, {
        y: 35,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.12,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.actions, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.35,
        ease: "power3.out",
      });
    },

    animateNewVariant() {
      if (!this.$gsap) return;

      this.$nextTick(() => {
        const rows = this.$refs.variantRows;
        const latestRow = Array.isArray(rows) ? rows[rows.length - 1] : rows;

        if (!latestRow) return;

        this.$gsap.fromTo(
          latestRow,
          { y: 24, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" },
        );
      });
    },

    generateSlug(text) {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    },

    async getCategories() {
      const { data, error } = await this.$supabase
        .from("merch_categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (!error) {
        this.categories = data || [];
      }
    },

    async getProduct() {
      this.loading = true;
      this.errorMessage = "";

      const { data, error } = await this.$supabase
        .from("merch_products")
        .select(
          `
          id,
          name,
          slug,
          description,
          price,
          compare_at_price,
          status,
          category_id,
          is_featured,
          merch_product_images (
            id,
            image_url,
            is_main,
            sort_order
          ),
          merch_product_variants (
            id,
            color,
            size,
            stock,
            sku,
            is_active
          )
        `,
        )
        .eq("id", this.productId)
        .single();

      if (error) {
        this.errorMessage = error.message;
        this.loading = false;
        return;
      }

      this.form = {
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        category_id: data.category_id || "",
        status: data.status || "draft",
        price: data.price || 0,
        compare_at_price: data.compare_at_price || 0,
        is_featured: data.is_featured || false,
      };

      this.images = (data.merch_product_images || [])
        .slice()
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((image) => ({
          key: image.id,
          id: image.id,
          url: image.image_url,
          file: null,
          is_main: !!image.is_main,
          isNew: false,
        }));

      if (this.images.length && !this.images.some((image) => image.is_main)) {
        this.images[0].is_main = true;
      }

      this.variants = (data.merch_product_variants || []).map((variant) => ({
        key: variant.id,
        id: variant.id,
        color: variant.color || "",
        size: variant.size || "",
        stock: variant.stock || 0,
        sku: variant.sku || "",
        is_active: variant.is_active,
        is_new: false,
      }));

      if (!this.variants.length) {
        this.addVariant();
      }

      this.loading = false;
    },

    addVariant() {
      this.variants.push({
        key: Date.now() + Math.random(),
        id: null,
        color: "",
        size: "",
        stock: 0,
        sku: "",
        is_active: true,
        is_new: true,
      });

      this.animateNewVariant();
    },

    removeVariant(index) {
      const variant = this.variants[index];

      if (variant.id) {
        this.deletedVariantIds.push(variant.id);
      }

      const row = this.$refs.variantRows?.[index];

      if (this.$gsap && row) {
        this.$gsap.to(row, {
          x: 30,
          opacity: 0,
          scale: 0.96,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            this.variants.splice(index, 1);
          },
        });
      } else {
        this.variants.splice(index, 1);
      }
    },

    handleImages(event) {
      const files = Array.from(event.target.files || []);
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      const validFiles = files.filter((file) =>
        allowedTypes.includes(file.type),
      );

      if (!validFiles.length) {
        this.errorMessage = "Please upload JPG, PNG, or WEBP images.";
        return;
      }

      const newImages = validFiles.map((file, index) => ({
        key: `${Date.now()}-${index}-${file.name}`,
        id: null,
        url: URL.createObjectURL(file),
        file,
        is_main: this.images.length === 0 && index === 0,
        isNew: true,
      }));

      this.images = [...this.images, ...newImages];

      if (!this.images.some((image) => image.is_main)) {
        this.images[0].is_main = true;
      }

      this.errorMessage = "";
      event.target.value = "";

      this.$nextTick(() => {
        if (this.$gsap) {
          this.$gsap.fromTo(
            ".preview-card",
            { y: 20, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.45,
              stagger: 0.06,
              ease: "power3.out",
            },
          );
        }
      });
    },

    removeImage(index) {
      const image = this.images[index];

      if (image.id) {
        this.deletedImageIds.push(image.id);
      }

      if (image.isNew && image.url) {
        URL.revokeObjectURL(image.url);
      }

      this.images.splice(index, 1);

      if (
        this.images.length &&
        !this.images.some((current) => current.is_main)
      ) {
        this.images[0].is_main = true;
      }
    },

    setMainImage(index) {
      this.images = this.images.map((image, imageIndex) => ({
        ...image,
        is_main: imageIndex === index,
      }));
    },

    async uploadFile(file) {
      const fileExt = file.name.split(".").pop();
      const cleanSlug = this.form.slug || Date.now();
      const fileName = `${Date.now()}-${Math.round(
        Math.random() * 10000,
      )}-${cleanSlug}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await this.$supabase.storage
        .from("merch-products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = this.$supabase.storage
        .from("merch-products")
        .getPublicUrl(filePath);

      return data.publicUrl;
    },

    async saveImages() {
      // Remove images the admin deleted.
      if (this.deletedImageIds.length) {
        const { error } = await this.$supabase
          .from("merch_product_images")
          .delete()
          .in("id", this.deletedImageIds);

        if (error) throw error;

        this.deletedImageIds = [];
      }

      // Upload any newly added files first.
      for (const image of this.images) {
        if (image.isNew && image.file) {
          image.url = await this.uploadFile(image.file);
        }
      }

      // Persist order + main flag for every remaining image.
      for (let index = 0; index < this.images.length; index++) {
        const image = this.images[index];

        const payload = {
          image_url: image.url,
          alt_text: this.form.name,
          is_main: !!image.is_main,
          sort_order: index + 1,
        };

        if (image.id) {
          const { error } = await this.$supabase
            .from("merch_product_images")
            .update(payload)
            .eq("id", image.id);

          if (error) throw error;
        } else {
          const { data, error } = await this.$supabase
            .from("merch_product_images")
            .insert({ product_id: this.productId, ...payload })
            .select("id")
            .single();

          if (error) throw error;

          image.id = data.id;
          image.isNew = false;
          image.file = null;
        }
      }
    },

    validateVariants() {
      if (!this.variants.length) {
        return "Add at least one product variant.";
      }

      const uniqueCheck = new Set();

      for (const variant of this.variants) {
        if (!variant.color || !variant.size) {
          return "Every variant needs a color and size.";
        }

        if (variant.stock < 0) {
          return "Stock cannot be less than 0.";
        }

        const key = `${variant.color.toLowerCase().trim()}-${variant.size
          .toLowerCase()
          .trim()}`;

        if (uniqueCheck.has(key)) {
          return `Duplicate variant found: ${variant.color} / ${variant.size}`;
        }

        uniqueCheck.add(key);
      }

      return null;
    },

    async updateProduct() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.form.name || !this.form.slug || !this.form.price) {
        this.errorMessage = "Product name, slug and price are required.";
        return;
      }

      const variantError = this.validateVariants();

      if (variantError) {
        this.errorMessage = variantError;
        return;
      }

      this.saving = true;

      try {
        const productPayload = {
          name: this.form.name.trim(),
          slug: this.form.slug.trim(),
          description: this.form.description || null,
          category_id: this.form.category_id || null,
          status: this.form.status,
          price: this.form.price,
          compare_at_price: this.form.compare_at_price || null,
          is_featured: this.form.is_featured,
        };

        const { error: productError } = await this.$supabase
          .from("merch_products")
          .update(productPayload)
          .eq("id", this.productId);

        if (productError) throw productError;

        await this.saveImages();

        if (this.deletedVariantIds.length) {
          const { error: deleteError } = await this.$supabase
            .from("merch_product_variants")
            .delete()
            .in("id", this.deletedVariantIds);

          if (deleteError) throw deleteError;
        }

        const existingVariants = this.variants.filter((variant) => variant.id);
        const newVariants = this.variants.filter((variant) => !variant.id);

        for (const variant of existingVariants) {
          const { error } = await this.$supabase
            .from("merch_product_variants")
            .update({
              color: variant.color.trim(),
              size: variant.size.trim(),
              stock: variant.stock || 0,
              sku: variant.sku || null,
              is_active: true,
            })
            .eq("id", variant.id);

          if (error) throw error;
        }

        if (newVariants.length) {
          const newVariantPayload = newVariants.map((variant) => ({
            product_id: this.productId,
            color: variant.color.trim(),
            size: variant.size.trim(),
            stock: variant.stock || 0,
            sku: variant.sku || null,
            is_active: true,
          }));

          const { error } = await this.$supabase
            .from("merch_product_variants")
            .insert(newVariantPayload);

          if (error) throw error;
        }

        this.successMessage = "Product updated successfully.";
        this.deletedVariantIds = [];

        if (this.$gsap) {
          this.$gsap.fromTo(
            ".success",
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
          );
        }

        setTimeout(() => {
          this.$router.push("/admin/products");
        }, 900);
      } catch (error) {
        this.errorMessage = error.message || "Failed to update product.";

        if (this.$gsap) {
          this.$gsap.fromTo(
            ".error",
            { x: -10, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
          );
        }
      } finally {
        this.saving = false;
      }
    },

    async deleteProduct() {
      const confirmDelete = confirm(
        `Are you sure you want to delete "${this.form.name}"?`,
      );

      if (!confirmDelete) return;

      const { error } = await this.$supabase
        .from("merch_products")
        .delete()
        .eq("id", this.productId);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.$router.push("/admin/products");
    },
  },
};

definePageMeta({
  layout: "admin-layout",
});
</script>

<style scoped lang="scss">
.edit-product-page {
  width: 100%;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;

  .eyebrow {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 4px;
    color: #9b753f;
  }

  h1 {
    margin: 0;
    font-size: clamp(32px, 5vw, 48px);
    letter-spacing: -2px;
    color: #111;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #777;
    font-size: 15px;
  }
}

.back-btn {
  text-decoration: none;
  background: #111;
  color: white;
  padding: 14px 18px;
  border-radius: 16px;
  font-weight: 900;
}

.loading {
  background: white;
  border-radius: 30px;
  padding: 50px;
  text-align: center;
  font-weight: 900;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.product-form {
  display: grid;
  gap: 22px;
}

.form-card {
  position: relative;
  background: white;
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -80px;
    right: -80px;
    width: 190px;
    height: 190px;
    border-radius: 50%;
    background: rgba(244, 210, 139, 0.22);
    pointer-events: none;
  }
}

.card-title {
  position: relative;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.8px;
  }

  p {
    margin: 7px 0 0;
    color: #777;
    font-size: 14px;
  }
}

.grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;

  &.full {
    grid-column: 1 / -1;
  }

  label {
    font-size: 13px;
    font-weight: 900;
    color: #333;
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid #ded8cf;
    border-radius: 17px;
    padding: 15px 16px;
    font-size: 15px;
    outline: none;
    background: #fbfaf8;
    transition: 0.25s ease;
    color: #111;

    &:focus {
      border-color: #111;
      background: white;
      box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
    }
  }

  textarea {
    min-height: 135px;
    resize: vertical;
  }
}

.toggle-btn {
  width: fit-content;
  border: none;
  padding: 15px 18px;
  border-radius: 16px;
  background: #f3eee6;
  color: #111;
  font-weight: 900;
  cursor: pointer;

  &.active {
    background: #111;
    color: white;
  }
}

.upload-box {
  min-height: 290px;
  border: 2px dashed #d8c6a8;
  border-radius: 26px;
  background: #fbfaf8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  transition: 0.25s ease;

  &:hover {
    background: #f6efe3;
    border-color: #b88b4a;
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    height: 390px;
    object-fit: cover;
  }
}

.upload-empty {
  .upload-icon {
    height: 58px;
    width: 58px;
    margin: 0 auto 16px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #111;
    color: white;
    font-size: 34px;
  }

  strong {
    font-size: 18px;
    color: #111;
  }

  p {
    margin: 8px 0 0;
    color: #777;
  }
}

.preview-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.preview-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  background: #fbfaf8;
  border: 1px solid #eee4d7;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.06);

  &.main {
    border: 2px solid #111;
  }

  img {
    width: 100%;
    height: 210px;
    object-fit: cover;
    display: block;
  }
}

.preview-actions {
  display: flex;
  gap: 8px;
  padding: 10px;

  button {
    flex: 1;
    border: none;
    padding: 11px 10px;
    border-radius: 13px;
    background: #111;
    color: white;
    font-weight: 900;
    cursor: pointer;
  }

  .danger {
    background: #ffe8e8;
    color: #b00020;
  }
}

@media (max-width: 980px) {
  .preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .preview-grid {
    grid-template-columns: 1fr;
  }
}

.variant-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;

  h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.8px;
  }

  p {
    margin: 7px 0 0;
    color: #777;
  }

  button {
    border: none;
    background: #111;
    color: white;
    padding: 14px 18px;
    border-radius: 16px;
    font-weight: 900;
    cursor: pointer;
  }
}

.variants {
  display: grid;
  gap: 16px;
}

.variant-row {
  position: relative;
  display: grid;
  grid-template-columns: 48px 1fr 1fr 1fr 1fr auto;
  gap: 14px;
  align-items: end;
  padding: 18px;
  border-radius: 24px;
  background: #fbfaf8;
  border: 1px solid #eee4d7;
}

.variant-number {
  height: 46px;
  width: 46px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: #111;
  color: white;
  font-weight: 900;
}

.remove {
  border: none;
  padding: 15px 16px;
  border-radius: 15px;
  background: #ffe8e8;
  color: #b00020;
  font-weight: 900;
  cursor: pointer;
}

.message {
  padding: 16px 18px;
  border-radius: 17px;
  font-weight: 900;

  &.error {
    background: #ffe8e8;
    color: #b00020;
  }

  &.success {
    background: #e7f8ec;
    color: #0f7a35;
  }
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 30px;

  div {
    display: flex;
    gap: 14px;
  }

  button {
    border: none;
    padding: 16px 24px;
    border-radius: 17px;
    font-weight: 900;
    cursor: pointer;

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }

  .cancel {
    background: white;
    color: #111;
  }

  .submit {
    background: #111;
    color: white;
  }

  .delete {
    background: #ffe8e8;
    color: #b00020;
  }
}

@media (max-width: 1200px) {
  .variant-row {
    grid-template-columns: 48px repeat(2, 1fr);

    .remove {
      grid-column: 1 / -1;
    }
  }
}

@media (max-width: 780px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }

  .grid,
  .variant-row {
    grid-template-columns: 1fr;
  }

  .variant-number {
    width: 100%;
  }

  .variant-head,
  .actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    div,
    button {
      width: 100%;
    }

    div {
      flex-direction: column;
    }
  }
}
</style>
