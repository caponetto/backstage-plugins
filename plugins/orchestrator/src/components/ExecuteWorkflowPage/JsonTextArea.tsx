import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import {
  Box,
  makeStyles,
  TextareaAutosize,
  Typography,
} from '@material-ui/core';

interface JsonTextAreaStyleProps {
  isValid: boolean;
}

interface JsonTextAreaProps {
  defaultValue?: string;
  rows?: number;
}

export interface JsonTextAreaRef {
  getContent: () => string;
  validate: () => boolean;
}

const useStyles = makeStyles({
  textarea: {
    width: '100%',
    resize: 'vertical',
    borderColor: (props: JsonTextAreaStyleProps) =>
      props.isValid ? 'initial' : 'red',
  },
});

export const JsonTextArea = forwardRef(
  (
    { defaultValue = '{}', rows = 6 }: JsonTextAreaProps,
    ref: ForwardedRef<JsonTextAreaRef>,
  ) => {
    const [value, setValue] = useState(defaultValue);
    const [isValid, setIsValid] = useState(true);
    const classes = useStyles({ isValid });

    const validate = useCallback(() => {
      let valid = true;
      try {
        JSON.parse(value);
        valid = true;
      } catch (error) {
        valid = false;
      }
      setIsValid(valid);
      return valid;
    }, [value]);

    useEffect(() => {
      if (isValid) {
        return;
      }
      validate();
    }, [isValid, validate]);

    useImperativeHandle(ref, () => ({
      getContent: () => value,
      validate,
    }));

    return (
      <Box>
        <TextareaAutosize
          value={value}
          onChange={e => setValue(e.target.value)}
          minRows={rows}
          className={classes.textarea}
        />
        {!isValid && (
          <Typography variant="caption" color="error">
            content must be a valid JSON
          </Typography>
        )}
      </Box>
    );
  },
);
