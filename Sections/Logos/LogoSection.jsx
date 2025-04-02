import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import styled from "styled-components";

const LogoSectionContainer = styled.div`
  width: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: var(--primary);
  transition: all 0.5s ease;
  position: relative;
  z-index: 1;
  gap: 3rem;

  @media (max-width: 767px) {
    padding: 3rem 1rem;
    min-height: 200px;
  }

  .logosection-title {
    width: 100%;
    max-width: 900px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    text-align: center;

    h2 {
      font-size: clamp(1.5rem, 3vw, 1rem);
      font-weight: 600;
      color: var(--para);
      line-height: 1.4;

      @media (max-width: 767px) {
        font-size: 1.5rem;
      }
    }
  }

  .logosection-logos {
    display: grid;
    grid-template-columns: repeat(4, minmax(150px, 1fr));
    align-items: center;
    justify-content: center;
    gap: 3rem 4rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(3, minmax(120px, 1fr));
      gap: 2.5rem 3rem;
    }

    @media (max-width: 767px) {
      grid-template-columns: repeat(2, minmax(100px, 1fr));
      gap: 2rem;
    }

    .logo-wrapper {
      width: 100%;
      height: 60px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }

      img {
        width: 50% !important;
        height: 100% !important;
        object-fit: contain;
        padding: 0.5rem;

        @media (max-width: 767px) {
          padding: 0.25rem;
        }
      }
    }
  }
`;

function LogoSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const logosRef = useRef(null);
  const animationExecuted = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const logos = logosRef.current;

    if (!animationExecuted.current) {
      gsap.fromTo(
        section,
        { backgroundColor: "var(--light)" },
        {
          backgroundColor: "var(--dark)",
          duration: 1.5,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top center",
            end: "bottom center",
            once: true,
          },
        }
      );

      gsap.fromTo(
        title,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 20%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        logos.children,
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: logos,
            start: "top 80%",
            end: "bottom 20%",
            once: true,
          },
        }
      );

      animationExecuted.current = true;
    }
  }, []);

  return (
    <LogoSectionContainer ref={sectionRef}>
      <div className="logosection-title" ref={titleRef}>
        <h2>Trusted by over 100+ innovative companies worldwide</h2>
      </div>
      <div className="logosection-logos" ref={logosRef}>
        {[
          "QgaauSKmm5ImIwFYNUe3dTNOkM",
          "9xcueDPzkJ5AJqEs9s0j47H0E", 
          "x6nWzkZt1AnmdyuhlGmmkJ6qZTk",
          "paedmzQPcym5C1svwXRxInmE9AQ",
          "ZNjShxVuTjd5GWLpn4SD3XKtC4",
          "feU6cpDocfBSGpqNrDgyOcTHTic",
          "Y3kDimZacf38yWmUC37JzIBlxhk",
          "DykZBL9mD6dP2FXFBmuUvfu44"
        ].map((id, index) => (
          <div key={index} className="logo-wrapper">
            <Image
              src={`https://framerusercontent.com/images/${id}.svg`}
              alt={`Company logo ${index + 1}`}
              fill
              priority={index < 4}
            />
          </div>
        ))}
      </div>
    </LogoSectionContainer>
  );
}

export default LogoSection;
