
"use client";

import { useState, useTransition } from "react";
import type {
  AdminCategorySummary,
  AdminProductSummary,
} from "@/lib/admin";

type ProductImageFormValue = {
  url: string;
  alt: string;
  isPrimary: boolean;
};

type FormState = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  discountPrice: string;
  categoryId: string;
  brand: string;
  sku: string;
  stock: string;
  tags: string;
  sizes: string;
  colors: string;
  targetGender: "men" | "women" | "unisex";
  isFeatured: boolean;
  isActive: boolean;
  attributes: string;
  images: ProductImageFormValue[];
};

const emptyForm: FormState = {
  id: null,
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  price: "",
  discountPrice: "",
  categoryId: "",
  brand: "",
  sku: "",
  stock: "0",
  tags: "",
  sizes: "",
  colors: "",
  targetGender: "unisex",
  isFeatured: false,
  isActive: true,
  attributes: "{}",
  images: [],
};

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {
      message: response.ok
        ? "The server returned an unreadable response."
        : "The server returned an unexpected response.",
    };
  }
}

function toCommaSeparated(value: string[]) {
  return value.join(", ");
}

function normalizeFormImages(images: ProductImageFormValue[]) {
  if (images.length === 0) {
    return [];
  }

  const primaryIndex = images.findIndex((image) => image.isPrimary);
  const normalizedPrimaryIndex = primaryIndex >= 0 ? primaryIndex : 0;

  return images.map((image, index) => ({
    ...image,
    isPrimary: index === normalizedPrimaryIndex,
  }));
}

function productToFormState(product: AdminProductSummary): FormState {
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    price: String(product.price),
    discountPrice:
      product.discountPrice !== null ? String(product.discountPrice) : "",
    categoryId: product.categoryId,
    brand: product.brand ?? "",
    sku: product.sku,
    stock: String(product.stock),
    tags: toCommaSeparated(product.tags),
    sizes: toCommaSeparated(product.sizes),
    colors: toCommaSeparated(product.colors),
    targetGender: product.targetGender,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    attributes: JSON.stringify(product.attributes, null, 2),
    images: normalizeFormImages(
      product.images.length > 0
        ? product.images.map((image) => ({
            url: image.url,
            alt: image.alt ?? product.name,
            isPrimary: image.isPrimary,
          }))
        : product.imageUrl
          ? [
              {
                url: product.imageUrl,
                alt: product.name,
                isPrimary: true,
              },
            ]
          : []
    ),
  };
}

export default function AdminProductManager({
  initialProducts,
  initialCategories,
}: {
  initialProducts: AdminProductSummary[];
  initialCategories: AdminCategorySummary[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm,
    categoryId: initialCategories[0]?._id ?? "",
  }));
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingMessage, setUploadingMessage] = useState<string | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setForm({
      ...emptyForm,
      categoryId: categories[0]?._id ?? "",
    });
    setManualImageUrl("");
  }

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateImages(
    updater: (images: ProductImageFormValue[]) => ProductImageFormValue[]
  ) {
    setForm((current) => ({
      ...current,
      images: normalizeFormImages(updater(current.images)),
    }));
  }

  function addManualImage() {
    const value = manualImageUrl.trim();

    if (!value) {
      return;
    }

    updateImages((current) => [
      ...current,
      {
        url: value,
        alt: form.name || "Product image",
        isPrimary: current.length === 0,
      },
    ]);
    setManualImageUrl("");
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setError(null);
    setFeedback(null);
    setUploadingMessage(
      files.length === 1 ? "Uploading image..." : `Uploading ${files.length} images...`
    );

    try {
      const uploadedImages: ProductImageFormValue[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/uploads", {
          method: "POST",
          body: formData,
        });

        const data = await readJsonResponse(response);

        if (!response.ok) {
          setError(
            typeof data?.message === "string"
              ? data.message
              : "Unable to upload image."
          );
          return;
        }

        const url = typeof data?.url === "string" ? data.url : "";
        const alt =
          typeof data?.alt === "string" && data.alt.trim()
            ? data.alt.trim()
            : file.name.replace(/\.[^.]+$/, "");

        if (!url) {
          setError("Image uploaded, but the response was invalid.");
          return;
        }

        uploadedImages.push({
          url,
          alt: alt || form.name || "Product image",
          isPrimary: false,
        });
      }

      updateImages((current) => [
        ...current,
        ...uploadedImages.map((image, index) => ({
          ...image,
          isPrimary: current.length === 0 && index === 0,
        })),
      ]);
      setFeedback(
        uploadedImages.length === 1 ? "Image uploaded." : "Images uploaded."
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload image."
      );
    } finally {
      setUploadingMessage(null);
      event.target.value = "";
    }
  }
  async function handleCategorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryName,
            slug: categorySlug,
          }),
        });

        const data = await readJsonResponse(response);

        if (!response.ok) {
          setError(
            typeof data?.message === "string"
              ? data.message
              : "Unable to create category."
          );
          return;
        }

        if (!data || !("category" in data) || !data.category) {
          setError("Category was saved, but the response was invalid.");
          return;
        }

        setCategories((current) =>
          [...current, data.category as AdminCategorySummary].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
        setForm((current) => ({
          ...current,
          categoryId: (data.category as AdminCategorySummary)._id,
        }));
        setCategoryName("");
        setCategorySlug("");
        setFeedback("Category created.");
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to create category."
        );
      }
    });
  }

  async function handleProductSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      try {
        let attributes: Record<string, string[]>;

        try {
          attributes = JSON.parse(form.attributes || "{}") as Record<
            string,
            string[]
          >;
        } catch {
          setError("Attributes must be valid JSON.");
          return;
        }

        const payload = {
          name: form.name,
          slug: form.slug,
          description: form.description,
          shortDescription: form.shortDescription,
          price: Number(form.price),
          discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
          categoryId: form.categoryId,
          brand: form.brand,
          sku: form.sku,
          stock: Number(form.stock),
          tags: form.tags,
          sizes: form.sizes,
          colors: form.colors,
          targetGender: form.targetGender,
          images: normalizeFormImages(form.images).map((image) => ({
            url: image.url,
            alt: image.alt,
            isPrimary: image.isPrimary,
          })),
          isFeatured: form.isFeatured,
          isActive: form.isActive,
          attributes,
        };

        const isEditing = Boolean(form.id);
        const response = await fetch(
          isEditing ? `/api/admin/products/${form.id}` : "/api/admin/products",
          {
            method: isEditing ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const data = await readJsonResponse(response);

        if (!response.ok) {
          setError(
            typeof data?.message === "string"
              ? data.message
              : "Unable to save product."
          );
          return;
        }

        if (!data || !("product" in data) || !data.product) {
          setError("Product was saved, but the response was invalid.");
          return;
        }

        const savedProduct = data.product as AdminProductSummary;

        setProducts((current) => {
          if (isEditing) {
            return current.map((product) =>
              product._id === savedProduct._id ? savedProduct : product
            );
          }

          return [savedProduct, ...current];
        });

        resetForm();
        setFeedback(isEditing ? "Product updated." : "Product created.");
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to save product."
        );
      }
    });
  }

  async function handleDelete(productId: string) {
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: "DELETE",
        });

        const data = await readJsonResponse(response);

        if (!response.ok) {
          setError(
            typeof data?.message === "string"
              ? data.message
              : "Unable to delete product."
          );
          return;
        }

        setProducts((current) =>
          current.filter((product) => product._id !== productId)
        );

        if (form.id === productId) {
          resetForm();
        }

        setFeedback("Product deleted.");
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete product."
        );
      }
    });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              Product Catalog
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
              Manage products
            </h2>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            New product
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1fr)] gap-3 bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-slate-200">
            {products.length === 0 ? (
              <div className="px-4 py-10 text-sm text-slate-500">
                No products yet.
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1fr)] gap-3 px-4 py-4 text-sm text-slate-700"
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {product.slug}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {product.images.length} image
                        {product.images.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-600">
                    {product.categoryName ?? "Unknown"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.discountPrice !== null ? (
                      <p className="text-xs text-rose-600">
                        Sale ${product.discountPrice.toFixed(2)}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <p
                      className={
                        product.stock <= 5
                          ? "font-semibold text-amber-700"
                          : "font-semibold text-slate-900"
                      }
                    >
                      {product.stock}
                    </p>
                    <p className="text-xs text-slate-500">
                      {product.isActive ? "Active" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setForm(productToFormState(product))}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Quick category
          </p>
          <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950">
            Add a category
          </h3>

          <form onSubmit={handleCategorySubmit} className="mt-5 space-y-4">
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Category name"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            />
            <input
              value={categorySlug}
              onChange={(event) => setCategorySlug(event.target.value)}
              placeholder="category-slug"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
            >
              Create category
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            Editor
          </p>
          <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950">
            {form.id ? "Edit product" : "Create product"}
          </h3>

          <form onSubmit={handleProductSubmit} className="mt-5 space-y-4">
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Product name"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
            <input
              value={form.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              placeholder="product-slug"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
            <input
              value={form.shortDescription}
              onChange={(event) =>
                updateField("shortDescription", event.target.value)
              }
              placeholder="Short description"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Description"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="Price"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
              <input
                value={form.discountPrice}
                onChange={(event) =>
                  updateField("discountPrice", event.target.value)
                }
                placeholder="Discount price"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={form.categoryId}
                onChange={(event) => updateField("categoryId", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                value={form.brand}
                onChange={(event) => updateField("brand", event.target.value)}
                placeholder="Brand"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.sku}
                onChange={(event) => updateField("sku", event.target.value)}
                placeholder="SKU"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
              <input
                value={form.stock}
                onChange={(event) => updateField("stock", event.target.value)}
                placeholder="Stock"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <select
              value={form.targetGender}
              onChange={(event) =>
                updateField(
                  "targetGender",
                  event.target.value as "men" | "women" | "unisex"
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            >
              <option value="unisex">Unisex</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
            </select>
            <input
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
              placeholder="Tags: new, summer, sale"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.sizes}
                onChange={(event) => updateField("sizes", event.target.value)}
                placeholder="Sizes: S, M, L"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
              <input
                value={form.colors}
                onChange={(event) => updateField("colors", event.target.value)}
                placeholder="Colors: Black, White"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div className="rounded-[1.6rem] border border-slate-200 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-950">Product images</p>
                  <p className="text-xs leading-5 text-slate-500">
                    Upload photos, choose the primary image, or paste a hosted image URL.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Upload images
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="url"
                  value={manualImageUrl}
                  onChange={(event) => setManualImageUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addManualImage();
                    }
                  }}
                  placeholder="Paste image URL and press Add"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
                <button
                  type="button"
                  onClick={addManualImage}
                  className="rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Add URL
                </button>
              </div>
              {form.images.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                  No product images added yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {form.images.map((image, index) => (
                    <div
                      key={`${image.url}-${index}`}
                      className="grid gap-3 rounded-[1.4rem] border border-slate-200 p-3"
                    >
                      <div className="flex gap-3">
                        <div className="h-28 w-24 shrink-0 overflow-hidden rounded-[1.2rem] bg-slate-100">
                          <img
                            src={image.url}
                            alt={image.alt || form.name || `Product image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <input
                            value={image.url}
                            onChange={(event) =>
                              updateImages((current) =>
                                current.map((item, currentIndex) =>
                                  currentIndex === index
                                    ? { ...item, url: event.target.value }
                                    : item
                                )
                              )
                            }
                            placeholder="Image URL"
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                          />
                          <input
                            value={image.alt}
                            onChange={(event) =>
                              updateImages((current) =>
                                current.map((item, currentIndex) =>
                                  currentIndex === index
                                    ? { ...item, alt: event.target.value }
                                    : item
                                )
                              )
                            }
                            placeholder="Alt text"
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateImages((current) =>
                                  current.map((item, currentIndex) => ({
                                    ...item,
                                    isPrimary: currentIndex === index,
                                  }))
                                )
                              }
                              className={
                                image.isPrimary
                                  ? "rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"
                                  : "rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                              }
                            >
                              {image.isPrimary ? "Primary image" : "Set primary"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateImages((current) =>
                                  current.filter((_, currentIndex) => currentIndex !== index)
                                )
                              }
                              className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              value={form.attributes}
              onChange={(event) => updateField("attributes", event.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    updateField("isFeatured", event.target.checked)
                  }
                />
                Featured product
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateField("isActive", event.target.checked)}
                />
                Visible in store
              </label>
            </div>

            {uploadingMessage ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                {uploadingMessage}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            {feedback ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {feedback}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending || Boolean(uploadingMessage)}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isPending ? "Saving..." : form.id ? "Update product" : "Create product"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
