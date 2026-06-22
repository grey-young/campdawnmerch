<template>
  <section class="flyers-page">
    <div class="page-head" ref="pageHead">
      <div>
        <p class="eyebrow">HOMEPAGE HERO</p>
        <h1>Flyers</h1>
        <span>
          Upload the flyers shown in the top section of the homepage. Order
          shown left to right. Top = first.
        </span>
      </div>
    </div>

    <!-- Upload card -->
    <div class="upload-card" ref="uploadCard">
      <div class="card-title">
        <h2>Add Flyer</h2>
        <p>PNG or JPG. A transparent PNG looks best in the hero strip.</p>
      </div>

      <div class="upload-grid">
        <label class="dropzone" :class="{ filled: newFlyer.preview }">
          <input type="file" accept="image/*" @change="onFileChange" />
          <img v-if="newFlyer.preview" :src="newFlyer.preview" alt="Preview" />
          <div v-else class="dropzone-hint">
            <i class="bi bi-image"></i>
            <span>Click to choose an image</span>
          </div>
        </label>

        <div class="fields">
          <div class="form-group">
            <label>Title (optional)</label>
            <input
              v-model="newFlyer.title"
              type="text"
              placeholder="e.g. New Drop"
            />
            <small>Shown on hover over the flyer.</small>
          </div>

          <div class="form-group">
            <label>Link (optional)</label>
            <input
              v-model="newFlyer.link_url"
              type="text"
              placeholder="/products or https://..."
            />
            <small>Where the "Shop Now" button goes. Defaults to /products.</small>
          </div>

          <button
            class="add-btn"
            type="button"
            :disabled="!newFlyer.file || uploading"
            @click="addFlyer"
          >
            {{ uploading ? "Uploading..." : "Add Flyer" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Existing flyers -->
    <div class="list-card" ref="listCard">
      <div class="card-title">
        <h2>Current Flyers</h2>
        <p>{{ flyers.length }} flyer{{ flyers.length === 1 ? "" : "s" }}.</p>
      </div>

      <div v-if="loading" class="state">Loading flyers...</div>

      <div v-else-if="!flyers.length" class="state">
        No flyers yet. Add one above and it will show on the homepage.
      </div>

      <div v-else class="flyer-list">
        <div
          v-for="(flyer, index) in flyers"
          :key="flyer.id"
          class="flyer-row"
          :class="{ inactive: !flyer.is_active }"
        >
          <span class="pos">{{ index + 1 }}</span>

          <div class="thumb">
            <img :src="flyer.image_url" :alt="flyer.title || 'Flyer'" />
          </div>

          <div class="meta">
            <strong>{{ flyer.title || "Untitled flyer" }}</strong>
            <small>{{ flyer.link_url || "/products" }}</small>
          </div>

          <div class="move">
            <button
              type="button"
              :disabled="index === 0"
              aria-label="Move up"
              @click="moveFlyer(index, -1)"
            >
              <i class="bi bi-chevron-up"></i>
            </button>
            <button
              type="button"
              :disabled="index === flyers.length - 1"
              aria-label="Move down"
              @click="moveFlyer(index, 1)"
            >
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>

          <button
            class="toggle"
            type="button"
            :class="{ on: flyer.is_active }"
            @click="toggleActive(flyer)"
          >
            {{ flyer.is_active ? "Active" : "Hidden" }}
          </button>

          <button
            class="delete"
            type="button"
            aria-label="Delete"
            @click="deleteFlyer(flyer)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="message error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="message success">{{ successMessage }}</div>
  </section>
</template>

<script>
export default {
  name: "AdminFlyersPage",

  data() {
    return {
      loading: true,
      uploading: false,
      flyers: [],
      newFlyer: {
        file: null,
        preview: "",
        title: "",
        link_url: "",
      },
      errorMessage: "",
      successMessage: "",
    };
  },

  async mounted() {
    await this.getFlyers();

    this.$nextTick(() => {
      this.animatePage();
    });
  },

  methods: {
    animatePage() {
      if (!this.$gsap) return;

      this.$gsap.from(
        [this.$refs.pageHead, this.$refs.uploadCard, this.$refs.listCard],
        {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        },
      );
    },

    async getFlyers() {
      this.loading = true;
      this.errorMessage = "";

      const { data, error } = await this.$supabase
        .from("merch_flyers")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        this.errorMessage = error.message;
        this.loading = false;
        return;
      }

      this.flyers = data || [];
      this.loading = false;
    },

    onFileChange(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      this.newFlyer.file = file;
      this.newFlyer.preview = URL.createObjectURL(file);
    },

    resetNewFlyer() {
      this.newFlyer = { file: null, preview: "", title: "", link_url: "" };
    },

    async addFlyer() {
      if (!this.newFlyer.file) return;

      this.uploading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const fileExt = this.newFlyer.file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `flyers/${fileName}`;

        const { error: uploadError } = await this.$supabase.storage
          .from("merch-products")
          .upload(filePath, this.newFlyer.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = this.$supabase.storage
          .from("merch-products")
          .getPublicUrl(filePath);

        const nextOrder = this.flyers.length
          ? Math.max(...this.flyers.map((flyer) => flyer.sort_order ?? 0)) + 1
          : 0;

        const payload = {
          image_url: publicData.publicUrl,
          title: this.newFlyer.title.trim() || null,
          link_url: this.newFlyer.link_url.trim() || null,
          sort_order: nextOrder,
          is_active: true,
        };

        const { data, error } = await this.$supabase
          .from("merch_flyers")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        this.flyers.push(data);
        this.resetNewFlyer();
        this.flash("Flyer added.");
      } catch (error) {
        this.errorMessage = error.message || "Failed to add flyer.";
      } finally {
        this.uploading = false;
      }
    },

    async moveFlyer(index, direction) {
      const target = index + direction;
      if (target < 0 || target >= this.flyers.length) return;

      const reordered = [...this.flyers];
      [reordered[index], reordered[target]] = [
        reordered[target],
        reordered[index],
      ];
      reordered.forEach((flyer, position) => {
        flyer.sort_order = position;
      });
      this.flyers = reordered;

      this.errorMessage = "";

      const results = await Promise.all(
        reordered.map((flyer) =>
          this.$supabase
            .from("merch_flyers")
            .update({ sort_order: flyer.sort_order })
            .eq("id", flyer.id),
        ),
      );

      const failed = results.find((result) => result.error);
      if (failed) {
        this.errorMessage = failed.error.message;
        return;
      }

      this.flash("Order updated.");
    },

    async toggleActive(flyer) {
      const nextValue = !flyer.is_active;

      const { error } = await this.$supabase
        .from("merch_flyers")
        .update({ is_active: nextValue })
        .eq("id", flyer.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      flyer.is_active = nextValue;
      this.flash(nextValue ? "Flyer is now visible." : "Flyer hidden.");
    },

    async deleteFlyer(flyer) {
      const confirmDelete = confirm("Delete this flyer?");
      if (!confirmDelete) return;

      this.errorMessage = "";

      const { error } = await this.$supabase
        .from("merch_flyers")
        .delete()
        .eq("id", flyer.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      // Best-effort: also remove the stored file.
      const path = this.storagePathFromUrl(flyer.image_url);
      if (path) {
        await this.$supabase.storage.from("merch-products").remove([path]);
      }

      this.flyers = this.flyers.filter((item) => item.id !== flyer.id);
      this.flash("Flyer deleted.");
    },

    // Pull the "flyers/xyz.png" object path back out of a public URL.
    storagePathFromUrl(url) {
      if (!url) return "";
      const marker = "/merch-products/";
      const at = url.indexOf(marker);
      return at === -1 ? "" : url.slice(at + marker.length);
    },

    flash(message) {
      this.successMessage = message;
      setTimeout(() => {
        this.successMessage = "";
      }, 1800);
    },
  },
};

definePageMeta({
  layout: "admin-layout",
});
</script>

<style scoped lang="scss">
.flyers-page {
  width: 100%;
}

.page-head {
  margin-bottom: 26px;

  .eyebrow {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 4px;
    color: #9b753f;
  }

  h1 {
    margin: 0;
    font-size: clamp(34px, 5vw, 50px);
    letter-spacing: -2px;
    color: #111;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #777;
    max-width: 640px;
  }
}

.upload-card,
.list-card {
  background: white;
  border-radius: 26px;
  padding: 24px;
  margin-bottom: 22px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.06);
}

.card-title {
  margin-bottom: 18px;

  h2 {
    margin: 0;
    font-size: 22px;
    letter-spacing: -0.6px;
  }

  p {
    margin: 6px 0 0;
    color: #777;
    font-size: 14px;
  }
}

.upload-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 22px;
}

.dropzone {
  position: relative;
  display: grid;
  place-items: center;
  height: 220px;
  border: 2px dashed #ded8cf;
  border-radius: 20px;
  background: #fbfaf8;
  cursor: pointer;
  overflow: hidden;
  transition: 0.2s ease;

  &:hover {
    border-color: #9b753f;
  }

  &.filled {
    border-style: solid;
  }

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #f3eee6;
  }

  .dropzone-hint {
    display: grid;
    justify-items: center;
    gap: 8px;
    color: #999;

    i {
      font-size: 30px;
    }

    span {
      font-weight: 700;
      font-size: 13px;
    }
  }
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;

  label {
    font-weight: 800;
    font-size: 13px;
    color: #333;
  }

  input {
    border: 1px solid #ded8cf;
    background: white;
    border-radius: 14px;
    padding: 14px 15px;
    font-size: 15px;
    outline: none;

    &:focus {
      border-color: #9b753f;
    }
  }

  small {
    color: #999;
    font-size: 12px;
  }
}

.add-btn {
  margin-top: 4px;
  align-self: flex-start;
  border: none;
  background: #111;
  color: white;
  padding: 14px 22px;
  border-radius: 15px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.state {
  color: #777;
  padding: 18px 0;
}

.flyer-list {
  display: grid;
  gap: 12px;
}

.flyer-row {
  display: grid;
  grid-template-columns: 34px 70px 1fr auto auto auto;
  align-items: center;
  gap: 14px;
  background: #fbfaf8;
  border: 1px solid #eee4d7;
  border-radius: 18px;
  padding: 12px 14px;

  &.inactive {
    opacity: 0.6;
  }

  .pos {
    font-weight: 900;
    color: #9b753f;
    text-align: center;
  }

  .thumb {
    width: 70px;
    height: 70px;
    border-radius: 12px;
    overflow: hidden;
    background: #f3eee6;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .meta {
    min-width: 0;

    strong {
      display: block;
      font-size: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: #999;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }
  }

  .move {
    display: flex;
    gap: 8px;

    button {
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 12px;
      background: #111;
      color: white;
      font-size: 16px;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: 0.2s ease;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
  }

  .toggle {
    border: none;
    border-radius: 12px;
    padding: 10px 16px;
    font-weight: 800;
    font-size: 13px;
    cursor: pointer;
    background: #eeeeee;
    color: #555;

    &.on {
      background: #e7f8ec;
      color: #0f7a35;
    }
  }

  .delete {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 12px;
    background: #ffe8e8;
    color: #b00020;
    font-size: 16px;
    cursor: pointer;
    display: grid;
    place-items: center;
  }
}

.message {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 50;
  padding: 16px 18px;
  border-radius: 17px;
  font-weight: 900;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);

  &.error {
    background: #ffe8e8;
    color: #b00020;
  }

  &.success {
    background: #e7f8ec;
    color: #0f7a35;
  }
}

@media (max-width: 720px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }

  .flyer-row {
    grid-template-columns: 28px 56px 1fr;
    grid-template-areas:
      "pos thumb meta"
      "move move move"
      "toggle toggle delete";
    row-gap: 12px;

    .pos {
      grid-area: pos;
    }
    .thumb {
      grid-area: thumb;
      width: 56px;
      height: 56px;
    }
    .meta {
      grid-area: meta;
    }
    .move {
      grid-area: move;
    }
    .toggle {
      grid-area: toggle;
    }
    .delete {
      grid-area: delete;
      justify-self: end;
    }
  }
}
</style>
