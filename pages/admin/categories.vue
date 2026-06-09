<template>
  <section class="categories-page">
    <div class="page-head" ref="pageHead">
      <div>
        <p class="eyebrow">MERCH SETUP</p>
        <h1>Categories</h1>
        <span>Create and manage merch categories.</span>
      </div>
    </div>

    <div class="layout">
      <form class="form-card" ref="formCard" @submit.prevent="saveCategory">
        <div class="card-title">
          <h2>{{ editingId ? "Edit Category" : "Create Category" }}</h2>
          <p>Organize products like tees, hoodies, caps and accessories.</p>
        </div>

        <div class="form-group">
          <label>Category Name</label>
          <input v-model="form.name" type="text" placeholder="Hoodies" />
        </div>

        <div class="form-group">
          <label>Slug</label>
          <input v-model="form.slug" type="text" placeholder="hoodies" />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="form.description"
            placeholder="Short category description..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Category Image</label>

          <div class="upload-box" @click="$refs.imageInput.click()">
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              hidden
              @change="handleImage"
            />

            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Category preview"
            />

            <div v-else>
              <strong>Upload Image</strong>
              <p>PNG, JPG or WEBP</p>
            </div>
          </div>
        </div>

        <div class="form-group toggle-line">
          <label>Category Status</label>

          <button
            type="button"
            class="toggle-btn"
            :class="{ active: form.is_active }"
            @click="form.is_active = !form.is_active"
          >
            {{ form.is_active ? "Active" : "Inactive" }}
          </button>
        </div>

        <div v-if="errorMessage" class="message error">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="message success">
          {{ successMessage }}
        </div>

        <div class="form-actions">
          <button
            v-if="editingId"
            type="button"
            class="cancel"
            @click="resetForm"
          >
            Cancel Edit
          </button>

          <button type="submit" class="submit" :disabled="saving">
            {{
              saving
                ? "Saving..."
                : editingId
                  ? "Update Category"
                  : "Create Category"
            }}
          </button>
        </div>
      </form>

      <div class="list-card" ref="listCard">
        <div class="list-head">
          <div>
            <h2>All Categories</h2>
            <p>{{ categories.length }} categories found</p>
          </div>

          <input v-model="search" type="text" placeholder="Search..." />
        </div>

        <div v-if="loading" class="loading">Loading categories...</div>

        <div v-else-if="filteredCategories.length === 0" class="empty">
          <h3>No categories found</h3>
          <p>Create your first merch category.</p>
        </div>

        <div v-else class="category-list" ref="categoryList">
          <article
            v-for="category in filteredCategories"
            :key="category.id"
            class="category-item"
          >
            <div class="cat-image">
              <img
                v-if="category.image_url"
                :src="category.image_url"
                :alt="category.name"
              />
              <span v-else>No Image</span>
            </div>

            <div class="cat-info">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description || "No description added." }}</p>

              <div class="meta">
                <span>{{ category.slug }}</span>
                <b :class="{ active: category.is_active }">
                  {{ category.is_active ? "Active" : "Inactive" }}
                </b>
              </div>
            </div>

            <div class="cat-actions">
              <button class="edit" @click="editCategory(category)">Edit</button>

              <button class="status" @click="toggleCategory(category)">
                {{ category.is_active ? "Disable" : "Enable" }}
              </button>

              <button class="delete" @click="deleteCategory(category)">
                Delete
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "AdminCategoriesPage",

  data() {
    return {
      loading: true,
      saving: false,
      search: "",
      categories: [],
      editingId: null,
      imageFile: null,
      imagePreview: "",
      errorMessage: "",
      successMessage: "",

      form: {
        name: "",
        slug: "",
        description: "",
        image_url: "",
        is_active: true,
      },
    };
  },

  computed: {
    filteredCategories() {
      return this.categories.filter((category) => {
        const term = this.search.toLowerCase();

        return (
          category.name.toLowerCase().includes(term) ||
          category.slug.toLowerCase().includes(term)
        );
      });
    },
  },

  watch: {
    "form.name"(value) {
      if (!this.editingId && !this.form.slug) {
        this.form.slug = this.generateSlug(value);
      }
    },
  },

  async mounted() {
    await this.getCategories();

    this.$nextTick(() => {
      this.animatePage();
    });
  },

  methods: {
    animatePage() {
      if (!this.$gsap) return;

      this.$gsap.from(this.$refs.pageHead, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      this.$gsap.from([this.$refs.formCard, this.$refs.listCard], {
        y: 35,
        opacity: 0,
        duration: 0.75,
        stagger: 0.12,
        delay: 0.15,
        ease: "power3.out",
      });
    },

    animateList() {
      if (!this.$gsap) return;

      this.$nextTick(() => {
        this.$gsap.from(".category-item", {
          y: 22,
          opacity: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power3.out",
        });
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
      this.loading = true;

      const { data, error } = await this.$supabase
        .from("merch_categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        this.errorMessage = error.message;
        this.loading = false;
        return;
      }

      this.categories = data || [];
      this.loading = false;

      this.animateList();
    },

    handleImage(event) {
      const file = event.target.files[0];

      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = "Please upload a JPG, PNG, or WEBP image.";
        return;
      }

      this.imageFile = file;
      this.imagePreview = URL.createObjectURL(file);
      this.errorMessage = "";

      this.$nextTick(() => {
        if (this.$gsap) {
          this.$gsap.fromTo(
            ".upload-box img",
            { scale: 1.08, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" },
          );
        }
      });
    },

    async uploadImage() {
      if (!this.imageFile) return this.form.image_url || null;

      const fileExt = this.imageFile.name.split(".").pop();
      const cleanSlug = this.form.slug || Date.now();
      const fileName = `${Date.now()}-${cleanSlug}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error } = await this.$supabase.storage
        .from("merch-products")
        .upload(filePath, this.imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = this.$supabase.storage
        .from("merch-products")
        .getPublicUrl(filePath);

      return data.publicUrl;
    },

    async saveCategory() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.form.name || !this.form.slug) {
        this.errorMessage = "Category name and slug are required.";
        return;
      }

      this.saving = true;

      try {
        const imageUrl = await this.uploadImage();

        const payload = {
          name: this.form.name.trim(),
          slug: this.form.slug.trim(),
          description: this.form.description || null,
          image_url: imageUrl,
          is_active: this.form.is_active,
        };

        if (this.editingId) {
          const { error } = await this.$supabase
            .from("merch_categories")
            .update(payload)
            .eq("id", this.editingId);

          if (error) throw error;

          this.successMessage = "Category updated successfully.";
        } else {
          const { error } = await this.$supabase
            .from("merch_categories")
            .insert(payload);

          if (error) throw error;

          this.successMessage = "Category created successfully.";
        }

        await this.getCategories();
        this.resetForm(false);

        setTimeout(() => {
          this.successMessage = "";
        }, 1800);
      } catch (error) {
        this.errorMessage = error.message || "Failed to save category.";
      } finally {
        this.saving = false;
      }
    },

    editCategory(category) {
      this.editingId = category.id;

      this.form = {
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        image_url: category.image_url || "",
        is_active: category.is_active,
      };

      this.imagePreview = category.image_url || "";
      this.imageFile = null;

      if (this.$gsap) {
        this.$gsap.fromTo(
          this.$refs.formCard,
          { scale: 0.98 },
          { scale: 1, duration: 0.35, ease: "power3.out" },
        );
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    async toggleCategory(category) {
      const { error } = await this.$supabase
        .from("merch_categories")
        .update({ is_active: !category.is_active })
        .eq("id", category.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      category.is_active = !category.is_active;
    },

    async deleteCategory(category) {
      const confirmDelete = confirm(
        `Are you sure you want to delete "${category.name}"?`,
      );

      if (!confirmDelete) return;

      const { error } = await this.$supabase
        .from("merch_categories")
        .delete()
        .eq("id", category.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.categories = this.categories.filter(
        (item) => item.id !== category.id,
      );
    },

    resetForm(clearMessage = true) {
      this.editingId = null;
      this.imageFile = null;
      this.imagePreview = "";

      this.form = {
        name: "",
        slug: "",
        description: "",
        image_url: "",
        is_active: true,
      };

      if (clearMessage) {
        this.errorMessage = "";
        this.successMessage = "";
      }
    },
  },
};

definePageMeta({
  layout: "admin-layout",
});
</script>

<style lang="scss" scoped>
.categories-page {
  width: 100%;
}

.page-head {
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
    font-size: clamp(34px, 5vw, 50px);
    letter-spacing: -2px;
    color: #111;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #777;
  }
}

.layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  align-items: start;
}

.form-card,
.list-card {
  background: white;
  border-radius: 30px;
  padding: 28px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.card-title,
.list-head {
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.8px;
  }

  p {
    margin: 7px 0 0;
    color: #777;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 18px;

  label {
    font-size: 13px;
    font-weight: 900;
    color: #333;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid #ded8cf;
    border-radius: 17px;
    padding: 15px 16px;
    font-size: 15px;
    outline: none;
    background: #fbfaf8;
    transition: 0.25s ease;

    &:focus {
      border-color: #111;
      background: white;
      box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }
}

.upload-box {
  min-height: 190px;
  border: 2px dashed #d8c6a8;
  border-radius: 24px;
  background: #fbfaf8;
  display: grid;
  place-items: center;
  cursor: pointer;
  overflow: hidden;
  text-align: center;

  img {
    width: 100%;
    height: 230px;
    object-fit: cover;
  }

  strong {
    font-size: 17px;
  }

  p {
    margin: 7px 0 0;
    color: #777;
  }
}

.toggle-line {
  margin-top: 6px;
}

.toggle-btn {
  width: fit-content;
  border: none;
  padding: 14px 18px;
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

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;

  button {
    border: none;
    padding: 15px 18px;
    border-radius: 16px;
    font-weight: 900;
    cursor: pointer;
  }

  .cancel {
    background: #f3eee6;
    color: #111;
  }

  .submit {
    background: #111;
    color: white;
  }
}

.message {
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 800;
  margin-bottom: 14px;

  &.error {
    background: #ffe8e8;
    color: #b00020;
  }

  &.success {
    background: #e7f8ec;
    color: #0f7a35;
  }
}

.list-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;

  input {
    width: 230px;
    border: 1px solid #ded8cf;
    border-radius: 16px;
    padding: 14px 15px;
    outline: none;
    background: #fbfaf8;
  }
}

.loading,
.empty {
  text-align: center;
  padding: 50px;
  background: #fbfaf8;
  border-radius: 24px;

  h3 {
    margin: 0;
  }

  p {
    color: #777;
  }
}

.category-list {
  display: grid;
  gap: 14px;
}

.category-item {
  display: grid;
  grid-template-columns: 92px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border-radius: 24px;
  background: #fbfaf8;
  border: 1px solid #eee4d7;
}

.cat-image {
  width: 92px;
  height: 92px;
  border-radius: 20px;
  background: #eee4d7;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: #777;
  font-size: 12px;
  font-weight: 900;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.cat-info {
  h3 {
    margin: 0;
    font-size: 20px;
    letter-spacing: -0.5px;
  }

  p {
    margin: 6px 0 10px;
    color: #777;
    font-size: 14px;
  }
}

.meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  span,
  b {
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
  }

  span {
    background: white;
    color: #111;
  }

  b {
    background: #eeeeee;
    color: #555;

    &.active {
      background: #e7f8ec;
      color: #0f7a35;
    }
  }
}

.cat-actions {
  display: flex;
  gap: 8px;

  button {
    border: none;
    padding: 12px 13px;
    border-radius: 14px;
    font-weight: 900;
    cursor: pointer;
  }

  .edit {
    background: #111;
    color: white;
  }

  .status {
    background: #f3eee6;
    color: #111;
  }

  .delete {
    background: #ffe8e8;
    color: #b00020;
  }
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .list-head,
  .category-item,
  .cat-actions,
  .form-actions {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .list-head input {
    width: 100%;
  }

  .category-item {
    display: flex;
    align-items: flex-start;
  }

  .cat-image {
    width: 100%;
    height: 180px;
  }
}
</style>
