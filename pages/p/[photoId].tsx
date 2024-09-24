import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Carousel from "../../components/Carousel";
import getResults from "../../utils/cachedImages";
import cloudinary from "../../utils/cloudinary";
import getBase64ImageUrl from "../../utils/generateBlurPlaceholder";
import type { ImageProps } from "../../utils/types";

const Home: NextPage = ({ currentPhoto }: { currentPhoto: ImageProps }) => {
  const router = useRouter();
  const { photoId } = router.query;
  let index = Number(photoId);

  // Construct the image URL for the current photo
  const currentPhotoUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_2560/${currentPhoto.public_id}.${currentPhoto.format}`;

  return (
    <>
      <Head>
        <title>Next.js Conf 2022 Photos</title>
        <meta property="og:image" content={currentPhotoUrl} />
        <meta name="twitter:image" content={currentPhotoUrl} />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        {/* Display the context metadata (description or alt) */}
        <p className="mb-4 text-center text-lg font-medium">
          {currentPhoto.context?.custom?.description ||
            "No description available"}
        </p>

        {/* Carousel component showing the image */}
        <Carousel currentPhoto={currentPhoto} index={index} />
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async (context) => {
  const results = await getResults();

  let reducedResults: ImageProps[] = [];
  let i = 0;
  for (let result of results.resources) {
    reducedResults.push({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
      context: result.context, // Include context metadata
    });
    i++;
  }

  // Find the photo based on the photoId from the URL params
  const currentPhoto = reducedResults.find(
    (img) => img.id === Number(context.params.photoId)
  );

  currentPhoto.blurDataUrl = await getBase64ImageUrl(currentPhoto);

  return {
    props: {
      currentPhoto: currentPhoto,
    },
  };
};

export async function getStaticPaths() {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by("public_id", "desc")
    .max_results(400)
    .execute();

  let fullPaths = [];
  for (let i = 0; i < results.resources.length; i++) {
    fullPaths.push({ params: { photoId: i.toString() } });
  }

  return {
    paths: fullPaths,
    fallback: false,
  };
}
