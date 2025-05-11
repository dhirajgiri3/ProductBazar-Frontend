"use client"

import React, { useRef } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { motion, useAnimation, useInView } from 'framer-motion';
import { IconBrandLinkedin, IconBrandTwitter, IconBrandFacebook, IconBrandInstagram, IconSend } from '@tabler/icons-react';

const FooterContainer = styled.footer`
  background-color: #0a0a0a;
  color: var(--light);
  padding: 5rem 1rem;
  font-family: 'clash', sans-serif;
  width: 100%;
  position: relative;
  z-index: 10;
  overflow: hidden;

  @media (min-width: 480px) {
    padding: 5rem 2rem;
  }

  @media (min-width: 768px) {
    padding: 6rem 3rem;
  }

  @media (min-width: 1024px) {
    padding: 7rem 4rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 3rem;
  }
`;

const FooterSection = styled.div`
  background-color: rgba(30, 30, 30, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(90, 60, 160, 0.15);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  &:hover {
    box-shadow: 0 8px 30px rgba(90, 60, 160, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.3);
  }

  h3 {
    font-size: var(--nm);
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--white);
    text-align: center;
    background: linear-gradient(to right, #a78bfa, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (min-width: 640px) {
      text-align: left;
    }
  }

  p {
    font-size: var(--sm);
    line-height: 1.6;
    margin-bottom: 1rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);

    @media (min-width: 640px) {
      text-align: left;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    @media (min-width: 640px) {
      align-items: flex-start;
    }
  }

  li {
    margin-bottom: 0.8rem;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateX(5px);
    }
  }

  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: var(--sm);
    transition: all 0.3s ease;
    display: inline-block;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -2px;
      left: 0;
      background: linear-gradient(to right, #a78bfa, #ec4899);
      transition: width 0.3s ease;
    }

    &:hover {
      color: var(--white);
      
      &:after {
        width: 100%;
      }
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin: 1.5rem 0;
  justify-content: center;

  @media (min-width: 640px) {
    justify-content: flex-start;
  }

  a {
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    position: relative;
    
    svg {
      position: relative;
      z-index: 2;
    }
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover {
      color: var(--white);
      transform: translateY(-5px);
      
      &::before {
        opacity: 1;
      }
    }
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  width: 100%;
  align-items: center;

  @media (min-width: 640px) {
    align-items: flex-start;
  }

  .relative {
    position: relative;
    width: 100%;
  }

  input {
    width: 100%;
    max-width: 300px;
    padding: 0.9rem 1rem;
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
    background-color: rgba(30, 30, 30, 0.5);
    color: var(--light);
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(4px);
    
    &:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
    }
  }

  button {
    width: 100%;
    max-width: 300px;
    padding: 0.9rem 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: var(--xs);
  color: var(--light);

  p {
    margin: 0.5rem 0;
    line-height: 1.5;
  }

  @media (min-width: 768px) {
    margin-top: 4rem;
    font-size: calc(var(--xs) + 1px);
  }
  
  .bg-violet-500\/70 {
    background-color: rgba(139, 92, 246, 0.7);
  }
`;

// Define animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const socialButtonVariants = {
  hover: (color) => ({
    y: -5,
    backgroundColor: color,
    transition: { duration: 0.2, ease: "easeOut" }
  })
};

// Color variants for social icons
const socialColors = {
  linkedin: "#0077B5",
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  instagram: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
};

const Footer = () => {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: false, amount: 0.1 });
  const controls = useAnimation();
  
  React.useEffect(() => {
    if (isInView) {
      controls.start("show");
    }
  }, [isInView, controls]);

  return (
    <FooterContainer ref={footerRef}>
      {/* Gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900">
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={controls}
        className="relative z-10"
      >
        {/* Headline */}
        <motion.div 
          variants={fadeInUp}
          className="mb-12 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-4 px-4 py-1 rounded-full bg-violet-900/30 border border-violet-700/50"
          >
            <span className="text-violet-300 font-medium">Join Our Community</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold mb-2 text-white"
          >
            Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">transform</span> how you connect?
          </motion.h2>
        </motion.div>

        <FooterContent>
          <motion.div variants={fadeInUp}>
            <FooterSection>
              <h3>About Us</h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                Learn more about Product Bazaar and our mission to connect innovators, freelancers, startups, and users on a dynamic platform.
              </motion.p>
            </FooterSection>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <FooterSection>
              <h3>Quick Links</h3>
              <ul>
                {[
                  { href: "/products", label: "Products" },
                  { href: "/jobs", label: "Jobs" },
                  { href: "/freelance-projects", label: "Freelance Projects" },
                  { href: "/startups", label: "Startups" },
                  { href: "/community", label: "Community" },
                  { href: "/blog", label: "Blog" }
                ].map((link, index) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </motion.li>
                ))}
              </ul>
            </FooterSection>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <FooterSection>
              <h3>Legal</h3>
              <ul>
                {[
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/cookies", label: "Cookie Policy" }
                ].map((link, index) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </motion.li>
                ))}
              </ul>
            </FooterSection>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <FooterSection>
              <h3>Follow Us</h3>
              <SocialLinks>
                <motion.a 
                  href="#" 
                  aria-label="LinkedIn"
                  variants={socialButtonVariants}
                  whileHover="hover"
                  custom={socialColors.linkedin}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <IconBrandLinkedin size={20} />
                </motion.a>
                <motion.a 
                  href="#" 
                  aria-label="Twitter"
                  variants={socialButtonVariants}
                  whileHover="hover"
                  custom={socialColors.twitter}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <IconBrandTwitter size={20} />
                </motion.a>
                <motion.a 
                  href="#" 
                  aria-label="Facebook"
                  variants={socialButtonVariants}
                  whileHover="hover"
                  custom={socialColors.facebook}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <IconBrandFacebook size={20} />
                </motion.a>
                <motion.a 
                  href="#" 
                  aria-label="Instagram"
                  variants={socialButtonVariants}
                  whileHover="hover"
                  custom={socialColors.instagram}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <IconBrandInstagram size={20} />
                </motion.a>
              </SocialLinks>
              
              <NewsletterForm>
                <motion.div 
                  className="relative w-full max-w-300px"
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <motion.div
                    whileHover={{ 
                      boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.3)",
                      y: -2
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <input type="email" placeholder="Enter your email address" aria-label="Email for newsletter" />
                  </motion.div>
                  <motion.button 
                    type="submit" 
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                    initial={{ boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)" }}
                  >
                    Subscribe <IconSend size={16} className="ml-2 inline" />
                  </motion.button>
                </motion.div>
              </NewsletterForm>
            </FooterSection>
          </motion.div>
        </FooterContent>
        
        <motion.div variants={fadeInUp}>
          <Copyright>
            <motion.div
              className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.p
                className="text-center"
                whileHover={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                © 2024 Product Bazaar. All rights reserved.
              </motion.p>
              <motion.div 
                className="hidden md:block w-1.5 h-1.5 rounded-full bg-violet-500/70"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.p
                className="text-center"
                whileHover={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                All trademarks, logos, and brand names are the property of their respective owners.
              </motion.p>
            </motion.div>
          </Copyright>
        </motion.div>
      </motion.div>
    </FooterContainer>
  );
};

export default Footer;