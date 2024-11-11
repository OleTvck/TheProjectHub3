import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [stepsReady, setStepsReady] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

  const steps: Step[] = [
    {
      target: '.color-legend',
      content: 'Create and save color schemes for your projects. Click any color to use it when creating a new project.',
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '.timeline-add-project',
      content: 'Click here to add a new project to your timeline.',
      placement: 'left',
    },
    {
      target: '.timeline-project',
      content: 'Click on any project to view its details and manage tasks in the Kanban board.',
      placement: 'top',
    },
  ];

  // Check if tour elements are ready
  useEffect(() => {
    if (currentUser && location.pathname === '/dashboard') {
      const checkElements = () => {
        const colorLegend = document.querySelector('.color-legend');
        const addProject = document.querySelector('.timeline-add-project');
        const timelineProject = document.querySelector('.timeline-project');

        return colorLegend && addProject && timelineProject;
      };

      const waitForElements = () => {
        if (checkElements()) {
          setStepsReady(true);
        } else {
          setTimeout(waitForElements, 500);
        }
      };

      waitForElements();
    }
  }, [currentUser, location.pathname]);

  // Start tour when elements are ready
  useEffect(() => {
    if (currentUser && location.pathname === '/dashboard' && stepsReady) {
      const hasSeenTour = localStorage.getItem('hasSeenTour');
      if (!hasSeenTour) {
        const timer = setTimeout(() => {
          setRun(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, location.pathname, stepsReady]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true');
    }

    // Prevent scrolling on target element click
    if (type === 'step:after') {
      window.scrollTo(0, 0);
    }
  };

  if (!currentUser || location.pathname !== '/dashboard' || !stepsReady) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      spotlightPadding={4}
      disableOverlayClose
      disableScrolling
      styles={{
        options: {
          primaryColor: '#3B82F6',
          zIndex: 1000,
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#3B82F6',
        },
        buttonBack: {
          marginRight: 10,
        },
        spotlight: {
          backgroundColor: 'transparent',
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
      callback={handleJoyrideCallback}
    />
  );
}