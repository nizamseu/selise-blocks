import { blocksClient } from "../../lib/blocks/client";

// Uploads one image into the project's default storage and returns a URL that
// can be stored on the product. The presign + PUT pair is the documented cloud
// flow; a local-storage configuration is handled by the same helper falling
// back to the multipart call.
export async function uploadImage(file: File): Promise<string> {
  const presign = (await blocksClient.data.files.presignedUploadUrl({
    accessModifier: "Private",
    configurationName: "Default",
    name: file.name,
    parentDirectoryId: ""
  })) as {
    fileId?: string;
    isSuccess?: boolean;
    uploadUrl?: string;
  } | undefined;

  if (presign?.isSuccess && presign.uploadUrl) {
    await blocksClient.data.files.uploadToUrl({
      body: file,
      contentType: file.type || "application/octet-stream",
      url: presign.uploadUrl
    });
    const info = (await blocksClient.data.files.get(String(presign.fileId), { configurationName: "Default" })) as {
      downloadUrl?: string;
      url?: string;
    } | undefined;
    return info?.downloadUrl ?? info?.url ?? file.name;
  }

  const local = (await blocksClient.data.files.uploadToLocalStorage({
    accessModifier: "Private",
    configurationName: "Default",
    file,
    name: file.name,
    parentDirectoryId: ""
  })) as { downloadUrl?: string; url?: string } | undefined;
  return local?.downloadUrl ?? local?.url ?? file.name;
}
