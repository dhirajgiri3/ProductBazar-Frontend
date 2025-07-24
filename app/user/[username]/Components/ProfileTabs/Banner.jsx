import React from 'react';
import Image from 'next/image';

function Banner() {
  const defaultBanner = "/Assets/Image/ProfileBg.png";

  return (
    <div className="relative w-full">
      {/* Banner Image Container */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-xl">
        {/* Banner Image */}
        <Image
          src={defaultBanner}
          alt="Profile Banner"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="transition-all duration-500"
        />
      </div>
    </div>
  );
}

export default Banner;