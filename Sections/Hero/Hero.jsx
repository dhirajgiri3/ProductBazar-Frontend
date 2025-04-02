import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  IconBox,
  IconBriefcase,
  IconClipboardList,
  IconRocket,
  IconSearch,
} from "@tabler/icons-react";
import { gsap } from "gsap";
import { AnimatedTooltipPreview } from "../../Components/UI/Tooltip/Tooltip";
import Image from "next/image";

const HeroContainer = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 6rem;
  background: var(--light);
  gap: 5rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
  padding-top: 8rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: radial-gradient(circle at top right, rgba(139, 255, 121, 0.15), transparent 50%),
                radial-gradient(circle at bottom right, rgba(77, 67, 255, 0.15), transparent 50%),
                radial-gradient(circle at top left, rgba(255, 67, 155, 0.15), transparent 50%),
                radial-gradient(circle at bottom left, rgba(255, 227, 67, 0.15), transparent 50%);
    z-index: 0;
  }

  @media (max-width: 767px) {
    padding: 2rem;
    gap: 2rem;
  }
`;

const HeroContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 2rem;
  position: relative;
  z-index: 2;

  @media (max-width: 767px) {
    gap: 1rem;
  }

  h1 {
    font-size: 4rem;
    font-family: "clash";
    font-weight: 700;
    color: var(--dark);
    width: 65%;
    line-height: 1.2;
    letter-spacing: -0.02em;
    background: linear-gradient(to right, var(--dark) 0%, var(--primary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (max-width: 767px) {
      font-size: 1.75rem;
      width: 100%;
    }
  }

  p {
    font-size: 1.125rem;
    color: var(--para);
    max-width: 55%;
    line-height: 1.7;
    font-weight: 400;

    @media (max-width: 767px) {
      font-size: 0.875rem;
      max-width: 95%;
    }
  }

  .hero-cta {
    display: flex;
    gap: 1.5rem;
    margin-top: 1.5rem;

    @media (max-width: 767px) {
      flex-direction: column;
      width: 100%;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .btn {
      padding: 1.125rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 180px;
      text-align: center;
      font-weight: 600;
      position: relative;
      overflow: hidden;

      @media (max-width: 767px) {
        width: 100%;
        padding: 0.875rem 1.5rem;
        font-size: 0.875rem;
        min-width: auto;
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

      &.btn-primary {
        background: var(--primary);
        color: var(--white);
        border: 2px solid var(--primary);
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.15);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.2);
        }
      }

      &.btn-secondary {
        background: transparent;
        color: var(--primary);
        border: 2px solid var(--primary);

        &:hover {
          background: rgba(79, 70, 229, 0.05);
          transform: translateY(-2px);
        }
      }
    }
  }
`;

const SearchQuickAccess = styled.section`
  width: 75%;
  padding: 2.5rem 3.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 2;

  @media (max-width: 767px) {
    width: 100%;
    padding: 1.25rem;
  }

  .search-bar {
    position: relative;
    width: 100%;
    margin-bottom: 1.25rem;

    input {
      width: 100%;
      padding: 1.125rem 1.5rem 1.125rem 3.25rem;
      border-radius: 0.875rem;
      outline: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(79, 70, 229, 0.2);
      color: var(--dark);
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.9);

      @media (max-width: 767px) {
        padding: 0.875rem 1rem 0.875rem 2.75rem;
        font-size: 0.875rem;
      }

      &::placeholder {
        color: var(--para);
        font-weight: 400;
      }

      &:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        background: white;
      }
    }

    &::before {
      content: '';
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1.25rem;
      height: 1.25rem;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239A999B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E") no-repeat center;
      z-index: 2;

      @media (min-width: 480px) {
        left: 1.25rem;
      }
    }

    .suggestions {
      opacity: 0;
      transform: translateY(-0.5rem);
      pointer-events: none;
      transition: all 0.3s ease;
      position: absolute;
      top: 100%;
      width: 100%;
      z-index: 500;
      left: 0;
      border-radius: 1rem;
      border: 1px solid rgba(231, 237, 251, 0.7);
      padding: 1rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      gap: 0.875rem;

      @media (min-width: 480px) {
        padding: 1.25rem;
        gap: 1rem;
      }

      &.active {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0.75rem);
      }

      p {
        font-weight: 600;
        font-size: 0.75rem;
        color: var(--dark);
        margin-bottom: 0.375rem;

        @media (min-width: 480px) {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
      }

      ul {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        padding: 0.25rem 0;

        @media (min-width: 480px) {
          gap: 0.75rem;
        }
      }

      li {
        cursor: pointer;
        font-size: 0.875rem;
        padding: 0.75rem;
        font-weight: 500;
        color: var(--para);
        border-radius: 0.5rem;
        transition: all 0.2s ease;

        @media (min-width: 480px) {
          font-size: 1rem;
          padding: 0.875rem 1rem;
        }

        &:hover {
          background: rgba(79, 70, 229, 0.05);
          color: var(--primary);
        }
      }

      .extended {
        display: flex;
        flex-direction: column;
        gap: 0.875rem;

        @media (min-width: 480px) {
          gap: 1rem;
        }

        li {
          padding: 0.625rem;
          border: 1px solid rgba(231, 237, 251, 0.7);
          transition: all 0.3s ease;

          @media (min-width: 480px) {
            padding: 0.75rem;
          }

          &:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
          }
        }
      }
    }
  }

  .quick-links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    width: 100%;

    @media (min-width: 480px) {
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    @media (min-width: 640px) {
      gap: 1.25rem;
    }

    .quick-link {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--para);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      text-align: center;
      padding: 0.875rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(231, 237, 251, 0.7);
      background: rgba(255, 255, 255, 0.5);

      @media (min-width: 480px) {
        font-size: 0.875rem;
        padding: 1rem;
        gap: 0.75rem;
      }

      @media (min-width: 640px) {
        font-size: 1rem;
        padding: 1.25rem;
      }

      &:hover {
        color: var(--primary);
        background: rgba(79, 70, 229, 0.05);
        transform: translateY(-2px);
        border-color: var(--primary);
      }

      svg {
        width: 1.125rem;
        height: 1.125rem;
        transition: all 0.3s ease;

        @media (min-width: 480px) {
          width: 1.25rem;
          height: 1.25rem;
        }
      }

      &:hover svg {
        transform: scale(1.1);
      }
    }
  }
`;

function Hero() {
  const [isActive, setIsActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const searchRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      const hero = heroRef.current;
      const content = contentRef.current;
      const search = searchRef.current;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                hero,
                { opacity: 0 },
                { opacity: 1, duration: 1.2, ease: "power3.out" }
              );

              gsap.fromTo(
                content.children,
                { y: 50, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 1.2,
                  stagger: 0.25,
                  ease: "power3.out",
                }
              );

              gsap.fromTo(
                search,
                { y: 50, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 1.2,
                  delay: 0.6,
                  ease: "power3.out",
                }
              );

              setHasAnimated(true);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(hero);

      return () => observer.disconnect();
    }
  }, [hasAnimated]);

  const handleSuggestionClick = (value) => {
    setSearchValue(value);
    setIsActive(false);
  };

  return (
    <HeroContainer ref={heroRef}>
      <HeroContent ref={contentRef}>
        <h1>Discover, Connect, and Grow Your Digital Products</h1>
        <p>
          Join the ultimate marketplace for digital innovation, where products
          thrive, careers flourish, and startups find their path to success.
        </p>
        <div className="hero-cta">
          <a href="/auth/register" className="btn btn-primary">
            Get Started
          </a>
          <a href="/products" className="btn btn-secondary">
            Explore Products
          </a>
        </div>
        <AnimatedTooltipPreview />
      </HeroContent>

      <SearchQuickAccess ref={searchRef}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for products, jobs, or projects..."
            aria-label="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsActive(true)}
            onBlur={() => setTimeout(() => setIsActive(false), 200)}
          />
          <div className={`suggestions ${isActive ? "active" : ""}`}>
            <p>Recent Searches</p>
            <ul>
              <li onClick={() => handleSuggestionClick("Best AI Image Generator")}>
                Best AI Image Generator
              </li>
              <li onClick={() => handleSuggestionClick("Best Productivity App")}>
                Best Productivity App
              </li>
            </ul>
            <p>Extended Searches</p>
            <ul className="extended">
              <li
                className="grid grid-cols-10 cursor-pointer overflow-hidden group"
                onClick={() => handleSuggestionClick("Best AI Image Generator")}
              >
                <div className="col-span-3 overflow-hidden rounded-xl h-[100px] w-auto">
                  <Image
                    className="rounded-xl group-hover:scale-105 transition-all duration-300 h-[100px] w-auto object-cover"
                    src="https://cdn.dribbble.com/userupload/10168024/file/original-584de18b3d24468ed593060e1468a769.png?resize=2048x1536"
                    alt="product"
                    width={100}
                    height={100}
                  />
                </div>
                <div className="col-span-7 p-3 flex flex-col justify-between">
                  <h4 className="text-base duration-200 group-hover:text-[#11BE86] font-medium text-black line-clamp-2">
                    Best AI Image Generator
                  </h4>
                  <div className="flex justify-between items-center gap-[0.5rem]">
                    <p className="flex text-sm gap-2 text-[#9A999B] items-center">
                      Product
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="quick-links">
          <a href="/products" className="quick-link">
            <IconBox />
            <span>Find Products</span>
          </a>
          <a href="/jobs" className="quick-link">
            <IconBriefcase />
            <span>Browse Jobs</span>
          </a>
          <a href="/freelance-projects" className="quick-link">
            <IconClipboardList />
            <span>Find Projects</span>
          </a>
          <a href="/startups" className="quick-link">
            <IconRocket />
            <span>Startups</span>
          </a>
        </div>
      </SearchQuickAccess>
    </HeroContainer>
  );
}

export default Hero;
