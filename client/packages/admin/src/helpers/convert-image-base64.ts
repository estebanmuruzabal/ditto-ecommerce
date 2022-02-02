export const getBase64Value = (
    image: File | Blob,
    callback: (imageBase64Value: string) => void
) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = () => {
      callback(reader.result as string);
    };
}