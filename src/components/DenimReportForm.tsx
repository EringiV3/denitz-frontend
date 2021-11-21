import { Box, Heading } from '@chakra-ui/react';
import Stepper from '../components/Stepper';
import { useDenimReportCreator } from '../hooks/useDenimReportCreator';
import SelectDenimStep from './SelectDenimStep';
import SelectFrontImageStep from './SelectFrontImageStep';

const steps = [
  {
    title: 'デニム選択',
    component: <SelectDenimStep />,
  },
  {
    title: 'フロント画像選択',
    component: <SelectFrontImageStep />,
  },
  {
    title: 'バック画像選択',
    component: <div>バック画像選択</div>,
  },
  {
    title: 'ディティール画像選択',
    component: <div>ディティール画像選択</div>,
  },
  {
    title: 'タイトル・説明文',
    component: <div>タイトル・説明文</div>,
  },
];

const DenimReportForm: React.FC = () => {
  const { currentStep } = useDenimReportCreator();

  return (
    <>
      <Box width="100%" marginTop="20px">
        <Stepper stepCount={steps.length} activeStep={currentStep} />
      </Box>
      <Heading size="md" marginTop="20px">
        {steps[currentStep - 1].title}
      </Heading>
      <Box>{steps[currentStep - 1].component}</Box>
    </>
  );
};

export default DenimReportForm;
