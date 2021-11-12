import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { createImage } from '../utils/image';
type Props = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  outputImageMaxWidth: number;
  setCroppedImageBlob: React.Dispatch<React.SetStateAction<Blob | null>>;
};
const ImageCropModal: React.FC<Props> = ({
  isOpen,
  onClose,
  imageUrl,
  outputImageMaxWidth,
  setCroppedImageBlob,
}) => {
  const aspect = 1;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [blob, setBlob] = useState<Blob | null>(null);

  const onCropComplete = useCallback(
    async (croppedArea: Area, croppedAreaPixels: Area) => {
      const outputWidth =
        croppedAreaPixels.width < outputImageMaxWidth
          ? croppedAreaPixels.width
          : outputImageMaxWidth;
      const outputHeight =
        croppedAreaPixels.width < outputImageMaxWidth
          ? croppedAreaPixels.height
          : outputImageMaxWidth / aspect;
      console.log(croppedArea, croppedAreaPixels);
      const image = await createImage(imageUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to crop the image.');
      }

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      ctx.drawImage(
        image as CanvasImageSource,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob === null) {
            reject('Failed to crop the image.');
          } else {
            resolve(blob);
          }
        }, 'image/png');
      });
      setBlob(blob);
    },
    [imageUrl, outputImageMaxWidth]
  );

  const handleClickCrop = () => {
    if (blob === null) {
      return;
    }
    setCroppedImageBlob(blob);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box height="300px" position="relative">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              showGrid={false}
              cropShape="round"
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </Box>
          <Box marginTop="40px">
            <Slider
              aria-label="image-crop-slider"
              defaultValue={0}
              min={1}
              max={3}
              step={0.1}
              onChange={(v) => setZoom(v)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Box display="flex" justifyContent="center" width="100%">
            <Button colorScheme="blue" onClick={handleClickCrop}>
              確定する
            </Button>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImageCropModal;