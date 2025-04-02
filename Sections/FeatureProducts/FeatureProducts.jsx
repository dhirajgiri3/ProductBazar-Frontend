import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

const FeatureProductsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background: var(--light);
  width: 100%;
  gap: 2rem;

  @media (min-width: 640px) {
    padding: 3rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 4rem;
  }
`;

const Title = styled.div`
  width: 100%;
  max-width: 800px;
  margin-bottom: 1rem;
  
  h2 {
    font-size: var(--lg);
    font-weight: 600;
    color: var(--dark);
    text-align: center;
    line-height: 1.3;

    @media (min-width: 640px) {
      font-size: var(--xl);
    }
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ProductCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 640px) {
    padding: 2rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--dark);
  color: var(--light);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: var(--sm);
  width: fit-content;
`;

const CardTitle = styled.h3`
  font-size: var(--md);
  font-weight: 600;
  color: var(--dark);
`;

const CardText = styled.p`
  color: var(--grey);
  font-size: var(--sm);
  line-height: 1.6;
`;

const CardList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardListItem = styled.li`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--light);
  border-radius: 0.5rem;
`;

const IconWrapper = styled.div`
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const ViewDetailsButton = styled.a`
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

function FeatureProducts() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const cardRefs = useRef([]);
  const animationExecuted = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const title = titleRef.current;
    const cards = cardRefs.current;

    if (!animationExecuted.current) {
      gsap.fromTo(
        title,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            once: true,
          },
        }
      );

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.2,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
          }
        );
      });

      animationExecuted.current = true;
    }
  }, []);

  return (
    <FeatureProductsContainer ref={containerRef}>
      <Title ref={titleRef}>
        <h2>Featured Products</h2>
      </Title>

      <ProductsGrid>
        <ProductCard ref={(el) => (cardRefs.current[0] = el)}>
          <CardHeader>
            <Image
              src="https://cdn.prod.website-files.com/64ad6f1aef87635bd23449f1/66607d885cad85c8f2324fdf_logo-okta.svg"
              alt="ProMark CRM"
              width={20}
              height={20}
            />
            <span>Featured</span>
          </CardHeader>
          <CardTitle>All-in-one CRM Tool</CardTitle>
          <CardText>
            ProMark CRM simplifies client interactions with intuitive lead management and performance analytics.
          </CardText>
          <CardList>
            <CardListItem>
              <IconWrapper>
                <Image
                  src="https://cdn.prod.website-files.com/64ad6f1aef87635bd23449f1/66607d885cad85c8f2324fdf_logo-okta.svg"
                  alt="Manage Leads"
                  width={24}
                  height={24}
                />
              </IconWrapper>
              <CardText>Unified customer management platform</CardText>
            </CardListItem>
            <CardListItem>
              <IconWrapper>
                <Image
                  src="https://cdn.prod.website-files.com/64ad6f1aef87635bd23449f1/66607d885cad85c8f2324fdf_logo-okta.svg"
                  alt="Analytics"
                  width={24}
                  height={24}
                />
              </IconWrapper>
              <CardText>Advanced analytics and reporting</CardText>
            </CardListItem>
            <CardListItem>
              <IconWrapper>
                <Image
                  src="https://cdn.prod.website-files.com/64ad6f1aef87635bd23449f1/66607d885cad85c8f2324fdf_logo-okta.svg"
                  alt="Mobile-friendly"
                  width={24}
                  height={24}
                />
              </IconWrapper>
              <CardText>Mobile-optimized interface</CardText>
            </CardListItem>
          </CardList>
          <ViewDetailsButton href="#">Learn More</ViewDetailsButton>
        </ProductCard>

        <ProductCard ref={(el) => (cardRefs.current[1] = el)}>
          <CardHeader>
            <Image
              src="https://cdn.prod.website-files.com/64ad6f1aef87635bd23449f1/66607d885cad85c8f2324fdf_logo-okta.svg"
              alt="TaskForce Pro"
              width={20}
              height={20}
            />
            <span>Featured</span>
          </CardHeader>
          <CardTitle>TaskForce Pro</CardTitle>
          <CardText>
            A comprehensive team productivity solution with real-time collaboration and project tracking capabilities.
          </CardText>
          <CardList>
            <CardListItem>
              <IconWrapper>
                <Image
                  src="https://cdn.prod.website-files.com/64ad6f1aef87635bd23449f1/66607d885cad85c8f2324fdf_logo-okta.svg"
                  alt="Task Management"
                  width={24}
                  height={24}
                />
              </IconWrapper>
              <CardText>Smart task management system</CardText>
            </CardListItem>
            <CardListItem>
              <IconWrapper>
                <Image
                  src="https://cdn.prod.website-files.com/64ad6f1aef87635bd23449f1/66607d885cad85c8f2324fdf_logo-okta.svg"
                  alt="Collaboration"
                  width={24}
                  height={24}
                />
              </IconWrapper>
              <CardText>Real-time team collaboration</CardText>
            </CardListItem>
            <CardListItem>
              <IconWrapper>
                <Image
                  src="https://cdn.prod.website-files.com/64ad6f1aef87635bd23449f1/66607d885cad85c8f2324fdf_logo-okta.svg"
                  alt="Cross-platform"
                  width={24}
                  height={24}
                />
              </IconWrapper>
              <CardText>Cross-platform accessibility</CardText>
            </CardListItem>
          </CardList>
          <ViewDetailsButton href="#">Learn More</ViewDetailsButton>
        </ProductCard>
      </ProductsGrid>
    </FeatureProductsContainer>
  );
}

export default FeatureProducts;
