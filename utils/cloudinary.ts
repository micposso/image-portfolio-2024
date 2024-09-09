import cloudinary from "cloudinary";

try {
  cloudinary.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log('Cloudinary successfully configured');
} catch (error) {
  console.error('Error configuring Cloudinary:', error.message);
  // You can add additional logging services here like Sentry or LogRocket if needed
}

export default cloudinary;
