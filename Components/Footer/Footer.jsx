"use client"

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { IconBrandLinkedin, IconBrandTwitter, IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';

const FooterContainer = styled.footer`
  background-color: #000000;
  color: var(--light);
  padding: 4rem 1rem;
  font-family: 'clash', sans-serif;
  width: 100%;
  position: relative;
  z-index: 10;

  @media (min-width: 480px) {
    padding: 4rem 2rem;
  }

  @media (min-width: 768px) {
    padding: 5rem 3rem;
  }

  @media (min-width: 1024px) {
    padding: 6rem 4rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
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
  h3 {
    font-size: var(--nm);
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--white);
    text-align: center;

    @media (min-width: 640px) {
      text-align: left;
    }
  }

  p {
    font-size: var(--sm);
    line-height: 1.6;
    margin-bottom: 1rem;
    text-align: center;

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
  }

  a {
    color: var(--light);
    text-decoration: none;
    font-size: var(--sm);
    transition: all 0.3s ease;
    display: inline-block;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      width: 0;
      height: 1px;
      bottom: -2px;
      left: 0;
      background-color: var(--white);
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
    color: var(--light);
    transition: transform 0.3s ease, color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);

    &:hover {
      color: var(--white);
      transform: translateY(-3px);
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

  input {
    width: 100%;
    max-width: 300px;
    padding: 0.8rem 1rem;
    border: 1px solid var(--light);
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--light);
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--white);
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  button {
    width: 100%;
    max-width: 300px;
    padding: 0.8rem 1rem;
    background-color: var(--white);
    color: #000000;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      background-color: var(--light);
      transform: translateY(-2px);
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
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>About Us</h3>
          <p>Learn more about Product Bazaar and our mission to connect innovators, freelancers, startups, and users on a dynamic platform.</p>
        </FooterSection>
        <FooterSection>
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/jobs">Jobs</Link></li>
            <li><Link href="/freelance-projects">Freelance Projects</Link></li>
            <li><Link href="/startups">Startups</Link></li>
            <li><Link href="/community">Community</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </FooterSection>
        <FooterSection>
          <h3>Legal</h3>
          <ul>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/cookies">Cookie Policy</Link></li>
          </ul>
        </FooterSection>
        <FooterSection>
          <h3>Follow Us</h3>
          <SocialLinks>
            <a href="#" aria-label="LinkedIn"><IconBrandLinkedin size={20} /></a>
            <a href="#" aria-label="Twitter"><IconBrandTwitter size={20} /></a>
            <a href="#" aria-label="Facebook"><IconBrandFacebook size={20} /></a>
            <a href="#" aria-label="Instagram"><IconBrandInstagram size={20} /></a>
          </SocialLinks>
          <NewsletterForm>
            <input type="email" placeholder="Enter your email address" aria-label="Email for newsletter" />
            <button type="submit">Subscribe to Newsletter</button>
          </NewsletterForm>
        </FooterSection>
      </FooterContent>
      <Copyright>
        <p>© 2024 Product Bazaar. All rights reserved.</p>
        <p>All trademarks, logos, and brand names are the property of their respective owners.</p>
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;