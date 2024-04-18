import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from "@/theme";


const steps = ['Upload DNA Passport', 'Analyse Data', 'View Results'];

export default function AnalysisStepper({
    activeStep,
    setActiveStep
}: {
    activeStep: number;
    setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}) {
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box className='lg:w-[852px] mx-auto'>
            <Stepper
                activeStep={activeStep}
                orientation={isMobile ? 'vertical' : 'horizontal'}
            >
                {steps.map((label) => {
                    const stepProps: { completed?: boolean } = {};
                    const labelProps: {
                        optional?: React.ReactNode;
                    } = {};
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel
                                {...labelProps}
                                className='text-xs sm:text-base'
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
        </Box>
    );
}