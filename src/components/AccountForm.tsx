import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Button from '../components/Button';
import {
  COLOR_CODE_GRAY,
  COLOR_CODE_INDIGO_BLUE,
  COLOR_CODE_WHITE,
} from '../config/css';
import { useGraphqlClient } from '../hooks/useGraphqlClient';
import { UserInput } from '../lib/graphql';
import { queryKeys } from '../utils/queryKeyFactory';

type Form = {
  accountId: string;
};
const AccountForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Form>({ mode: 'onBlur', reValidateMode: 'onChange' });

  const { client, hasToken } = useGraphqlClient();

  const reactQueryClient = useQueryClient();

  const toast = useToast();

  const { data: currentUserData } = useQuery(
    queryKeys.currentUser(),
    () => client.GetCurrentUser(),
    {
      enabled: hasToken,
    }
  );

  const { data: unavailableAccountIds } = useQuery(
    ['unavailableAccountIds'],
    () => fetch('/unavailableAccountIds.json').then((res) => res.json()),
    { staleTime: Infinity }
  );

  const updateUserMutation = useMutation(
    ({ updateUserId, input }: { updateUserId: string; input: UserInput }) =>
      client.UpdateUser({ updateUserId: updateUserId, input }),
    {
      onSuccess: () => {
        toast({
          title: 'アカウント情報を更新しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        reactQueryClient.invalidateQueries(queryKeys.currentUser());
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
    if (currentUserData?.getCurrentUser?.id === undefined) {
      return;
    }

    updateUserMutation.mutate({
      updateUserId: currentUserData.getCurrentUser.id,
      input: {
        accountId: data.accountId,
      },
    });
  };

  useEffect(() => {
    if (currentUserData && currentUserData.getCurrentUser) {
      setValue('accountId', currentUserData.getCurrentUser.accountId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserData]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl id="accountId" isRequired>
        <FormLabel color={COLOR_CODE_INDIGO_BLUE} fontWeight="bold">
          ID
        </FormLabel>
        <Input
          color={COLOR_CODE_INDIGO_BLUE}
          backgroundColor={COLOR_CODE_WHITE}
          borderColor={COLOR_CODE_WHITE}
          {...register('accountId', {
            required: 'この項目は必須です',
            maxLength: {
              value: 40,
              message: '40文字以内で入力してください',
            },
            pattern: {
              value: /^[A-Za-z0-9_-]+$/,
              message: '使用不可能な文字が含まれています',
            },
            validate: {
              isAvailableId: async (value) => {
                if (value === currentUserData?.getCurrentUser?.accountId) {
                  return true;
                }
                const data = await client.IsAvailableAccountId({
                  value,
                });
                const isValid =
                  !unavailableAccountIds.includes(value) &&
                  data.isAvailableAccountId;
                return isValid || 'このIDは使用できません';
              },
            },
          })}
        />
        <FormHelperText color={COLOR_CODE_GRAY}>
          IDには半角英数字、ハイフン、アンダースコアのみ使用可能です。
        </FormHelperText>
        <FormHelperText color="red">{errors.accountId?.message}</FormHelperText>
      </FormControl>
      <Box display="flex" justifyContent="center" marginTop="40px">
        <Button type="submit" isLoading={updateUserMutation.isLoading}>
          保存する
        </Button>
      </Box>
    </form>
  );
};

export default AccountForm;
