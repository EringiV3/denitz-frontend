import {
  Box,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRecoilValue } from 'recoil';
import Button from '../components/Button';
import { COLOR_CODE_INDIGO_BLUE, COLOR_CODE_WHITE } from '../config/css';
import { useDenimReportCreator } from '../hooks/useDenimReportCreator';
import { useGraphqlClient } from '../hooks/useGraphqlClient';
import { useUploadImage } from '../hooks/useUploadImage';
import { DenimReportInput } from '../lib/graphql';
import {
  backImageState,
  denimIdState,
  detailImagesState,
  frontImageState,
} from '../states/denimReportCreator';
import { queryKeys } from '../utils/queryKeyFactory';

type Form = {
  title: string;
  description: string;
};
const TitleDescriptionStep: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const { upload } = useUploadImage();

  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const { client, hasToken } = useGraphqlClient();

  const reactQueryClient = useQueryClient();

  const toast = useToast();

  const { backToPreviousStep } = useDenimReportCreator();

  const frontImage = useRecoilValue(frontImageState);
  const backImage = useRecoilValue(backImageState);
  const detailImage = useRecoilValue(detailImagesState);
  const denimId = useRecoilValue(denimIdState);

  const { data: currentUserData } = useQuery(
    queryKeys.currentUser(),
    () => client.GetCurrentUser(),
    {
      enabled: hasToken,
    }
  );

  const createDenimReportMutation = useMutation(
    (input: DenimReportInput) => client.CreateDenimReport({ input }),
    {
      onSuccess: (_, input) => {
        toast({
          title: '色落ち記録を作成しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        reactQueryClient.invalidateQueries(queryKeys.denim(input.denimId));
        router.push(
          `/${currentUserData?.getCurrentUser?.accountId}/denims/${input.denimId}`
        );
      },
      onError: () => {
        toast({
          title: 'エラーが発生しました',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      },
    }
  );

  const onSubmit: SubmitHandler<Form> = async (data) => {
    if (denimId === null) {
      return;
    }
    if (frontImage === null) {
      return;
    }
    setIsUploading(true);
    const [frontImageUrl, backImageUrl] = await Promise.all(
      [frontImage, backImage].map(async (image) => {
        if (image) {
          const imageUrl = await upload(image.blob);
          return imageUrl;
        }
      })
    );

    const detailImageUrls = await Promise.all(
      detailImage.map(async (image) => {
        const imageUrl = await upload(image.blob);
        return imageUrl;
      })
    );

    createDenimReportMutation.mutate({
      denimId,
      frontImageUrl,
      backImageUrl,
      detailImageUrls,
      title: data.title,
      description: data.description,
    });
    setIsUploading(false);
  };

  const handleClickBack = () => {
    backToPreviousStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl id="title" isRequired marginTop="20px">
        <FormLabel color={COLOR_CODE_INDIGO_BLUE} fontWeight="bold">
          タイトル
        </FormLabel>
        <Input
          backgroundColor={COLOR_CODE_WHITE}
          borderColor={COLOR_CODE_WHITE}
          color={COLOR_CODE_INDIGO_BLUE}
          {...register('title', {
            required: 'この項目は必須です',
            maxLength: { value: 30, message: '30文字以内で入力してください' },
          })}
        />
        <FormHelperText color="red">{errors.title?.message}</FormHelperText>
      </FormControl>
      <FormControl id="description" marginTop="20px">
        <FormLabel color={COLOR_CODE_INDIGO_BLUE}>説明文</FormLabel>
        <Textarea
          backgroundColor={COLOR_CODE_WHITE}
          borderColor={COLOR_CODE_WHITE}
          color={COLOR_CODE_INDIGO_BLUE}
          {...register('description')}
        />
        <FormHelperText color="red">
          {errors.description?.message}
        </FormHelperText>
      </FormControl>
      <Box display="flex" justifyContent="center" marginTop="40px">
        <ButtonGroup>
          <Button onClick={handleClickBack}>戻る</Button>
          <Button
            type="submit"
            isLoading={createDenimReportMutation.isLoading || isUploading}
          >
            送信
          </Button>
        </ButtonGroup>
      </Box>
    </form>
  );
};

export default TitleDescriptionStep;
