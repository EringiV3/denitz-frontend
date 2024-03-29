import { Box, ButtonGroup, useToast } from '@chakra-ui/react';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';
import Button from '../components/Button';
import DenimCard from '../components/DenimCard';
import { useDenimReportCreator } from '../hooks/useDenimReportCreator';
import { useGraphqlClient } from '../hooks/useGraphqlClient';
import { denimIdState } from '../states/denimReportCreator';
import { queryKeys } from '../utils/queryKeyFactory';

const SelectDenimStep: React.FC = () => {
  const [denimId, setDenimId] = useRecoilState(denimIdState);
  const { client, hasToken } = useGraphqlClient();
  const { goToNextStep } = useDenimReportCreator();
  const toast = useToast();

  const { data: currentUserData } = useQuery(
    queryKeys.currentUser(),
    () => client.GetCurrentUser(),
    {
      enabled: hasToken,
    }
  );

  const handleClickCard = (denimId: string) => {
    setDenimId(denimId);
  };

  const handleClickNext = () => {
    if (denimId === null) {
      toast({
        title: 'デニムを選択してください',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    goToNextStep();
  };

  return (
    <>
      <Box>
        {currentUserData?.getCurrentUser?.denims?.map((denim) => (
          <Box
            key={denim.id}
            marginTop="20px"
            onClick={() => handleClickCard(denim.id)}
          >
            <DenimCard denim={denim} showBorder={denimId === denim.id} />
          </Box>
        ))}
      </Box>
      <Box display="flex" justifyContent="center" marginTop="40px">
        <ButtonGroup>
          <Button onClick={handleClickNext}>次へ</Button>
        </ButtonGroup>
      </Box>
    </>
  );
};

export default SelectDenimStep;
