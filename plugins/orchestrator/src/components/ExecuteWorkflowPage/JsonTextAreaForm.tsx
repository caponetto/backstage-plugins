import React from 'react';

import { JsonValue } from '@backstage/types';

import { Box, Grid, useTheme } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { Editor } from '@monaco-editor/react';

import SubmitButton from '../SubmitButton/SubmitButton';

const JsonTextAreaForm = ({
  isExecuting,
  handleExecute,
}: {
  isExecuting: boolean;
  handleExecute: (
    getParameters: () => Record<string, JsonValue>,
  ) => Promise<void>;
}) => {
  const [jsonText, setJsonText] = React.useState('{}');
  const theme = useTheme();
  const getParameters = (): Record<string, JsonValue> => {
    if (!jsonText) {
      return {};
    }
    const parameters = JSON.parse(jsonText);
    return parameters as Record<string, JsonValue>;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info" style={{ width: '100%' }}>
          <AlertTitle>
            Couldn't find a valid JSON schema to display the input form.
          </AlertTitle>
          If you want to use a form to start the workflow, please provide a
          valid JSON schema in the dataInputSchema property of your workflow
          definition file. Alternatively, you can type below the input data in
          JSON format.
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <Box style={{ border: `1px solid ${theme.palette.border}` }}>
          <Editor
            language="json"
            onChange={(value: string | undefined) => setJsonText(value || '')}
            height="30rem"
            options={{
              lineNumbers: 'off',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,
              minimap: { enabled: false },
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <SubmitButton
          submitting={isExecuting}
          handleClick={() => handleExecute(getParameters)}
        >
          Run
        </SubmitButton>
      </Grid>
    </Grid>
  );
};

export default JsonTextAreaForm;
