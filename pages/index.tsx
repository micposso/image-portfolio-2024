import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import Bg from "../components/Icons/Bg";
import Modal from "../components/Modal";
import cloudinary from "../utils/cloudinary";
import getBase64ImageUrl from "../utils/generateBlurPlaceholder";
import type { ImageProps } from "../utils/types";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";
import { Oswald } from "next/font/google";
import { Rufina } from "next/font/google";


const oswald = Oswald({
  weight: ["400", "700"], // Specify the font weights you need
  subsets: ["latin"], // Specify the character subsets
});

const rufina = Rufina({
  weight: ["400", "700"], // Specify the font weights you need
  subsets: ["latin"], // Specify the character subsets
});

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
  const year = new Date().getFullYear();
  const router = useRouter();
  const { photoId } = router.query;
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();

  const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current?.scrollIntoView({ block: "center" });
      setLastViewedPhoto(null);
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto]);

  return (
    <>
      <Head>
        <title>Event Photos</title>
        <meta
          name="description"
          content="Event photos gallery using Cloudinary and Next.js"
        />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              setLastViewedPhoto(photoId);
            }}
          />
        )}
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          <div className="relative mb-5 flex h-screen flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Bg />
            </div>

            <h1
              className="mb-4 mt-8 text-lg font-bold tracking-widest"
              style={rufina.style}
            >
              Michael Posso
            </h1>
            <p
              className="max-w-[40ch] text-white/75 sm:max-w-[32ch]"
              style={oswald.style}
            >
              I am a front-end software developer and tech lead with over a decade of
              experience delivering accessible, high-performance web experiences
              for Fortune 500 companies. As a manager, I have led
              cross-functional teams, driving innovation and establishing best
              practices in web development. Passionate about education, I teach
              UX/UI design and web development at the undergraduate and graduate
              levels, helping students merge design thinking with technical
              execution.
            </p>
          </div>
          {images.length > 0 ? (
            images.map(({ id, public_id, format, blurDataUrl, context }) => (
              <Link
                key={id}
                href={`/?photoId=${id}`}
                as={`/p/${id}`}
                ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
                shallow
                className="group relative mb-5 block w-full cursor-zoom-in"
              >
                <Image
                  alt={context?.custom?.alt || "Michael Posso"}
                  className="transform rounded-lg brightness-90 transition group-hover:brightness-110"
                  style={{ transform: "translate3d(0, 0, 0)" }}
                  placeholder="blur"
                  blurDataURL={blurDataUrl}
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
                  width={720}
                  height={480}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
                />
              </Link>
            ))
          ) : (
            <>
              <p>No images found.</p>
              {console.log("Images array:", images)}
            </>
          )}
        </div>
      </main>
      <footer className="p-6 text-center text-white/80 sm:p-12">
        &copy; {year} Michael Posso
      </footer>
    </>
  );
};

export default Home;

export async function getStaticProps() {
  try {
    console.log("Fetching images from Cloudinary...");
    const results = await cloudinary.v2.search
      .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
      .with_field("context")
      .sort_by("public_id", "desc")
      .max_results(400)
      .execute();

    console.log("Cloudinary API response:", results);

    if (!results.resources || results.resources.length === 0) {
      console.warn("No images found in the specified Cloudinary folder.");
      return {
        props: {
          images: [],
        },
      };
    }

    const reducedResults: ImageProps[] = results.resources.map((result, i) => ({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
      context: result.context,
    }));

    console.log("Reduced results:", reducedResults);

    const blurImagePromises = results.resources.map((image: ImageProps) =>
      getBase64ImageUrl(image)
    );
    const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

    reducedResults.forEach((image, i) => {
      image.blurDataUrl = imagesWithBlurDataUrls[i];
    });

    console.log("Final images with blur data URLs:", reducedResults);

    return {
      props: {
        images: reducedResults,
      },
    };
  } catch (error) {
    console.error("Error fetching images:", error);
    return {
      props: {
        images: [],
      },
    };
  }
}
