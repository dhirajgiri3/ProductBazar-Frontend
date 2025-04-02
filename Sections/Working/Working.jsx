import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Store as IconSeller, ShoppingCart as IconBuyer, Work as IconFreelancer, PersonSearch as IconJobSeeker, RocketLaunch as IconStartup } from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const workingSteps = [
  {
    title: "Sellers",
    icon: <IconSeller />,
    description: "List and sell your digital products to a global audience",
    cta: "Start Selling"
  },
  {
    title: "Buyers", 
    icon: <IconBuyer />,
    description: "Discover and purchase high-quality digital products",
    cta: "Browse Products"
  },
  {
    title: "Freelancers",
    icon: <IconFreelancer />,
    description: "Find projects and showcase your skills to potential clients",
    cta: "Find Work"
  },
  {
    title: "Job Seekers",
    icon: <IconJobSeeker />,
    description: "Connect with innovative companies and find your next role",
    cta: "View Jobs"
  },
  {
    title: "Startups",
    icon: <IconStartup />,
    description: "Get exposure to investors and early adopters",
    cta: "Get Started"
  }
];

const Section = styled.section`
  padding: 8rem 0;
  background: var(--white);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: var(--dark);
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  text-align: center;
  max-width: 600px;
  margin: 0 auto 4rem;
  color: var(--grey);
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 6rem;
`;

const Card = styled.div`
  background: transparent;
  padding: 2rem;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--light);
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--dark);

  svg {
    width: 24px;
    height: 24px;
    color: var(--primary);
  }
`;

const CardDescription = styled.p`
  color: var(--grey);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
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
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);

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

  &:hover {
    background: var(--primary);
    color: var(--white);
  }
`;

const CTASection = styled.section`
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
  padding: 8rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  }
`;

const CTAContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CTATitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 1.5rem;
  line-height: 1.2;

  @media (min-width: 640px) {
    font-size: 3.5rem;
  }
`;

const CTAText = styled.p`
  color: #dddddddd;
  font-size: var(--nm);
  margin-bottom: 3rem;
  line-height: 1.6;
  width: 70%;
  text-align: center;
`;

const CTAButton = styled.button`
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
  background: var(--white);
  color: var(--primary);
  border: 2px solid var(--white);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);

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
      rgba(79, 70, 229, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

const Working = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const gridRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const section = sectionRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const grid = gridRef.current;
    const cta = ctaRef.current;

    gsap.fromTo([title, subtitle],
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
      }
    );

    gsap.fromTo(grid.children,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: grid,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        },
      }
    );

    gsap.fromTo(cta,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: cta,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
      }
    );
  }, []);

  return (
    <>
      <Section ref={sectionRef}>
        <Container>
          <Title ref={titleRef}>How It Works</Title>
          <Subtitle ref={subtitleRef}>
            Join our marketplace and connect with the right opportunities for your needs
          </Subtitle>
          <Grid ref={gridRef}>
            {workingSteps.map((item, index) => (
              <Card key={index}>
                <CardTitle>
                  {item.icon}
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
                <Button>{item.cta}</Button>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      <CTASection>
        <CTAContainer ref={ctaRef}>
          <CTATitle>Ready to Transform Your Digital Journey?</CTATitle>
          <CTAText>Join thousands of creators, entrepreneurs, and innovators who are already building their future with us.</CTAText>
          <CTAButton>Get Started For Free</CTAButton>
        </CTAContainer>
      </CTASection>
    </>
  );
};

export default Working;