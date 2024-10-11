import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.min.css";
// @ts-ignore
import SwiperCore, { Autoplay } from "swiper";
import { isMobile } from "@/utils/device";
import { AD_ANNOUNCEMENT } from "@/utils/constantLocal";
import { getAd } from "@/services/indexer";
import { SwiperCloseButton } from "./Icons";
SwiperCore.use([Autoplay]);
interface IAdItem {
  id: number;
  title: string;
  text: string;
  image_url: string;
  image_mobile_url: string;
  type: string;
  jump_type: string;
  jump_url: string;
}
export default function AdSwiper() {
  const [closeStatus, setCloseStatus] = useState(true);
  const [adList, setAdList] = useState<IAdItem[]>([]);
  useEffect(() => {
    getAd().then((res: IAdItem[]) => {
      const ids = res
        .reduce((acc, cur) => {
          acc.push(cur.id);
          return acc;
        }, [] as number[])
        .sort();
      const cachedIds = localStorage.getItem(AD_ANNOUNCEMENT);
      if (ids.length && cachedIds && cachedIds == JSON.stringify(ids)) {
        setCloseStatus(true);
      } else {
        setCloseStatus(false);
      }
      setAdList(res);
    });
  }, []);
  const closePop = (e: any) => {
    const ids = adList
      .reduce((acc, cur) => {
        acc.push(cur.id);
        return acc;
      }, [] as number[])
      .sort();
    localStorage.setItem(AD_ANNOUNCEMENT, JSON.stringify(ids));
    e.stopPropagation();
    setCloseStatus(true);
  };
  const is_mobile = isMobile();
  return (
    <>
      {closeStatus || adList.length == 0 ? null : (
        <div>
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoHeight={false}
            autoplay={{
              delay: 10000,
              disableOnInteraction: false,
            }}
            loop={adList.length == 1 ? false : true}
          >
            {adList.map((ad: IAdItem) => {
              return (
                <SwiperSlide key={ad.id}>
                  <div
                    onClick={closePop}
                    className="flex justify-end items-center absolute top-0 right-0 cursor-pointer z-10"
                  >
                    <SwiperCloseButton className="cursor-pointer"></SwiperCloseButton>
                  </div>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => {
                      window.open(ad.jump_url);
                    }}
                  >
                    {is_mobile ? (
                      <img src={ad.image_mobile_url} className="mt-3" />
                    ) : (
                      <img src={ad.image_url} className="mt-2" />
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </>
  );
}
