import cloudinary from 'src/cloudinary';

export default async function uploadImage(image: string): Promise<string> {
  try {
    if (!image) {
      throw new Error('image string not supplied');
    }

    const { secure_url } = await cloudinary.uploader.upload(image);

    if (!secure_url) throw new Error('failed to upload image');

    return secure_url;
  } catch (error) {
    console.error('error in image upload function: ', error);
    throw error;
  }
}
