import { Box, ButtonGroup, Link, useToast } from '@chakra-ui/react';
import NextImage from 'next/image';
import React from 'react';
import { useRecoilState } from 'recoil';
import Button from '../components/Button';
import { COLOR_CODE_PINK } from '../config/css';
import { useDenimReportCreator } from '../hooks/useDenimReportCreator';
import { frontImageState } from '../states/denimReportCreator';
import { readFile } from '../utils/image';

const SelectFrontImageStep: React.FC = () => {
  const { goToNextStep, backToPreviousStep } = useDenimReportCreator();
  const [frontImage, setFrontImage] = useRecoilState(frontImageState);
  const toast = useToast();

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file === null) {
      return;
    }
    readFile(file).then((url) => {
      setFrontImage({
        previewUrl: url,
        blob: file,
      });
    });
  };

  const handleClickNext = () => {
    if (frontImage === null) {
      toast({
        title: '画像を選択してください',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    goToNextStep();
  };

  const handleClickBack = () => {
    backToPreviousStep();
  };

  return (
    <>
      <Box>
        {frontImage && (
          <Box
            display="flex"
            justifyContent="center"
            position="relative"
            width="100%"
            height="200px"
            marginTop="20px"
          >
            <NextImage
              src={frontImage.previewUrl}
              layout="fill"
              objectFit="contain"
            />
          </Box>
        )}
        <Box display="flex" justifyContent="center" marginTop="40px">
          <label>
            <Link
              fontWeight="bold"
              textDecoration="underline"
              color={COLOR_CODE_PINK}
            >
              画像を選択する
            </Link>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleChangeFile}
            />
          </label>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" marginTop="40px">
        <ButtonGroup>
          <Button onClick={handleClickBack}>戻る</Button>
          <Button onClick={handleClickNext}>次へ</Button>
        </ButtonGroup>
      </Box>
    </>
  );
};

export default SelectFrontImageStep;
