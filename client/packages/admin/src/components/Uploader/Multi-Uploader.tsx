import React, { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { styled } from 'baseui';
import { UploadIcon } from '../../assets/icons/UploadIcon';
import {ADMIN_IMAGE_HOST} from "../../helpers/images-path";

const Text = styled('span', ({ $theme }) => ({
  ...$theme.typography.font14,
  fontFamily: $theme.typography.primaryFontFamily,
  color: $theme.colors.textDark,
  marginTop: '15px',
  textAlign: 'center',
}));

const TextHighlighted = styled('span', ({ $theme }) => ({
  color: $theme.colors.primary,
  fontWeight: 'bold',
}));

const Container = styled('div', ({ props }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '30px',
  borderWidth: '2px',
  borderRadius: '2px',
  borderColor: '#E6E6E6',
  borderStyle: 'dashed',
  backgroundColor: '#ffffff',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border 0.24s ease-in-out',
  cursor: 'pointer',
}));

const ThumbsContainer = styled('aside', () => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: '16px',
}));

const Thumb = styled('div', ({ $theme }) => ({
  ...$theme.borders.borderEA,
  display: 'inline-flex',
  borderRadius: '2px',
  marginBottom: '8px',
  marginRight: '8px',
  width: '100px',
  height: '100px',
  padding: '4px',
  boxSizing: 'border-box',
}));

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden',
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%',
};

function MultiUploader({ onChange, imagesURL }: any) {
  const [files, setFiles] = useState([]);

  React.useEffect(() => {
    let urls = [];
    if (imagesURL) {
      for (let i = 0; i < imagesURL.length; i++) {
        urls.push({
          name: 'demo' + i,
          preview: ADMIN_IMAGE_HOST+imagesURL[i]
        })
      }
    }

    setFiles(urls)
  }, [imagesURL]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    multiple: true,
    onDrop: useCallback(
      (acceptedFiles) => {
        setFiles(
          acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );
        onChange(acceptedFiles);
      },
      [onChange]
    ),
  });

  const thumbs = files.map((file) => (
    <Thumb key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} alt={file.name} />
      </div>
    </Thumb>
  ));

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  return (
    <section className='container uploader'>
      <Container {...getRootProps()}>
        <input {...getInputProps()} />
        <UploadIcon />
        <Text>
          <TextHighlighted>Drag/Upload</TextHighlighted> your images here.
        </Text>
      </Container>
      {thumbs && <ThumbsContainer>{thumbs}</ThumbsContainer>}
    </section>
  );
}

export default MultiUploader;
