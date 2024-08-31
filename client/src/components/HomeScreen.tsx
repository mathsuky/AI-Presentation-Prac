import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface HomeScreenProps {
  images: string[];
}

// const slideImages = [
//   // "/placeholder.svg?height=400&width=600",
//   // "/placeholder.svg?height=400&width=600",
//   // "/placeholder.svg?height=400&width=600",
// ];

const HomeScreen: React.FC<HomeScreenProps> = ({ images }) => {
  return (
    <Carousel className="w-full max-w-xl mx-auto">
      <CarouselContent>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
              {/* <Image
                src={src}
                alt={`Slide ${index + 1}`}
                layout="fill"
                objectFit="cover"
              /> */}
              <img src={src} alt={`Slide ${index + 1}`} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
    </Carousel>
  );
};

export default HomeScreen;
