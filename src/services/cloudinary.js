/**
 * Завантаження фото в Cloudinary.
 * Якщо потрібні інші cloud name або upload_preset — зміни нижче.
 */
const CLOUDINARY_CLOUD_NAME = "dcayywgtr";
const UPLOAD_PRESET = "testtest";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

/**
 * Визначає MIME-тип за розширенням файлу.
 */
function getMimeType(fileName) {
  const ext = (fileName || "").split(".").pop()?.toLowerCase();
  const map = {
    png: "image/png",
    gif: "image/gif",
    heic: "image/heic",
    webp: "image/webp",
  };
  return map[ext] ?? "image/jpeg";
}

/**
 * Завантажує зображення з локального uri в Cloudinary.
 * @param {string} uri - Локальний шлях до файлу (наприклад з ImagePicker)
 * @param {string} [fileName] - Ім'я файлу (опційно)
 * @param {string} [mimeType] - MIME-тип (опційно, визначається за fileName)
 * @returns {Promise<string>} secure_url з відповіді Cloudinary
 * @throws {Error} при помилці мережі або відповіді API
 */
export async function uploadImage(uri, fileName, mimeType) {
  const name = fileName || uri.split("/").pop() || "photo.jpg";
  const type = mimeType || getMimeType(name);

  const formData = new FormData();
  formData.append("file", {
    uri,
    name,
    type,
  });
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || data.message || "Upload failed");
  }
  if (!data.secure_url) {
    throw new Error("No secure_url in response");
  }

  return data.secure_url;
}
