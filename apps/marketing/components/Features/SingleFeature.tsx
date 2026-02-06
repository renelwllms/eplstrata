import Link from "next/link";
import { Feature } from "@/types/feature";

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, title, paragraph, href } = feature;

  return (
    <div className="w-full">
      <div className="wow fadeInUp" data-wow-delay=".15s">
        {href ? (
          <Link
            href={href}
            className="group block rounded-md border border-transparent p-4 transition hover:border-primary/40 hover:shadow-three"
          >
            <div className="mb-10 flex h-[70px] w-[70px] items-center justify-center rounded-md bg-primary bg-opacity-10 text-primary">
              {icon}
            </div>
            <h3 className="mb-5 text-xl font-bold text-black transition group-hover:text-primary dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
              {title}
            </h3>
            <p className="pr-[10px] text-base font-medium leading-relaxed text-body-color">
              {paragraph}
            </p>
          </Link>
        ) : (
          <div className="block rounded-md p-4">
            <div className="mb-10 flex h-[70px] w-[70px] items-center justify-center rounded-md bg-primary bg-opacity-10 text-primary">
              {icon}
            </div>
            <h3 className="mb-5 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
              {title}
            </h3>
            <p className="pr-[10px] text-base font-medium leading-relaxed text-body-color">
              {paragraph}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleFeature;
