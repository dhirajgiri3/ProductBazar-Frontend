import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

const TrendingProductsContainer = styled.section`
  padding: 2rem 1rem;
  background: var(--light);
  width: 100%;

  @media (min-width: 640px) {
    padding: 3rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 4rem 5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: var(--lg);
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--dark);
  line-height: 1.3;

  @media (min-width: 640px) {
    font-size: var(--xl);
    margin-bottom: 2rem;
  }
`;

const Introduction = styled.p`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 2rem;
  color: var(--grey);
  font-size: var(--xs);
  line-height: 1.6;

  @media (min-width: 640px) {
    font-size: var(--sm);
    margin-bottom: 3rem;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  video {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  padding: 1.25rem;

  @media (min-width: 640px) {
    padding: 1.5rem;
  }
`;

const ProductTitle = styled.h3`
  font-size: var(--nm);
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--dark);
`;

const ProductCategory = styled.span`
  font-size: var(--xs);
  color: var(--grey);
  display: block;
  margin-bottom: 0.75rem;
`;

const ProductDescription = styled.p`
  font-size: var(--xs);
  color: var(--grey);
  margin-bottom: 1rem;
  line-height: 1.5;

  @media (min-width: 640px) {
    font-size: var(--sm);
  }
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const RatingStars = styled.span`
  color: #ffc107;
  font-size: var(--sm);
`;

const RatingCount = styled.span`
  font-size: var(--xs);
  color: var(--grey);
`;

const CTAButton = styled.a`
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: var(--primary);
  color: var(--white);
  border: 2px solid var(--primary);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.15);

  @media (min-width: 480px) {
    width: auto;
    min-width: 140px;
  }

  @media (min-width: 640px) {
    font-size: 1rem;
    padding: 1rem 1.75rem;
    min-width: 160px;
  }

  @media (min-width: 768px) {
    padding: 1.125rem 2rem;
    min-width: 180px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.2);
  }
`;

const trendingProducts = [
  {
    id: 1,
    name: "OptiFlow AI",
    category: "Tools – AI Automation",
    description:
      "OptiFlow AI is revolutionizing the way businesses automate workflows with its advanced artificial intelligence capabilities.",
    videoUrl:
      "https://cdn.dribbble.com/userupload/7920227/file/original-2fa44c4f06e7b35cdb9b2b80815835fd.mp4",
    rating: 4.8,
    reviewCount: 300,
    cta: "Explore OptiFlow AI",
  },
  {
    id: 2,
    name: "DesignX Studio",
    category: "Templates – Graphic Design",
    description:
      "DesignX Studio offers an extensive collection of high-quality, fully customizable graphic design templates for social media, branding, and presentations.",
    videoUrl:
      "https://cdn.dribbble.com/userupload/11635789/file/original-ccd6342f016ea4a589accdde3b2c0ec7.mp4",
    rating: 4.9,
    reviewCount: 180,
    cta: "Discover DesignX Studio",
  },
  {
    id: 3,
    name: "AI-Powered Insights",
    category: "Tools – AI Automation",
    description:
      "AI-Powered Insights is a powerful tool that uses artificial intelligence to analyze data and provide insights that can help businesses make better decisions.",
    videoUrl:
      "https://cdn.dribbble.com/userupload/17109055/file/original-2cafa8b32d4d214f655c9c127ad036fd.mp4",
    rating: 4.9,
    reviewCount: 180,
    cta: "Explore AI-Powered Insights",
  },
];

function TrendingProducts() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const introRef = useRef(null);
  const cardRefs = useRef([]);
  const animationCompleted = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const title = titleRef.current;
    const intro = introRef.current;
    const cards = cardRefs.current;

    if (!animationCompleted.current) {
      gsap.fromTo(
        [title, intro],
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            once: true,
          },
        }
      );

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
          }
        );
      });

      animationCompleted.current = true;
    }
  }, []);

  return (
    <TrendingProductsContainer ref={containerRef}>
      <SectionTitle ref={titleRef}>Trending Products</SectionTitle>
      <Introduction ref={introRef}>
        Discover the most popular products gaining attention on Product Bazaar. From innovative software to powerful tools, find what's in demand.
      </Introduction>
      <ProductGrid>
        {trendingProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            ref={(el) => (cardRefs.current[index] = el)}
          >
            <video src={product.videoUrl} autoPlay loop muted playsInline />
            <ProductInfo>
              <ProductTitle>{product.name}</ProductTitle>
              <ProductCategory>{product.category}</ProductCategory>
              <ProductDescription>{product.description}</ProductDescription>
              <ProductRating>
                <RatingStars>{"★".repeat(Math.floor(product.rating))}</RatingStars>
                <RatingCount>
                  ({product.rating}/5 · {product.reviewCount} reviews)
                </RatingCount>
              </ProductRating>
              <CTAButton href="#">{product.cta}</CTAButton>
            </ProductInfo>
          </ProductCard>
        ))}
      </ProductGrid>
    </TrendingProductsContainer>
  );
}

export default TrendingProducts;
