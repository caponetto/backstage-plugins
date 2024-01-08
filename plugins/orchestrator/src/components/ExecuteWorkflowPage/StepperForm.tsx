import React from 'react';

import { Content, StructuredMetadataTable } from '@backstage/core-components';
import { JsonValue } from '@backstage/types';

import {
  Box,
  Button,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@material-ui/core';
import { withTheme } from '@rjsf/core-v5';
import { Theme as MuiTheme } from '@rjsf/material-ui-v5';
import validator from '@rjsf/validator-ajv8';
import { JSONSchema7 } from 'json-schema';

import SubmitBtn from '../SubmitBtn/SubmitBtn';

const MuiForm = withTheme<Record<string, JsonValue>>(MuiTheme);

const ReviewStep = ({
  busy,
  formDataObjects,
  refSchemas,
  handleBack,
  handleReset,
  handleExecute,
}: {
  busy: boolean;
  formDataObjects: Record<string, JsonValue>[];
  refSchemas: JSONSchema7[];
  handleBack: () => void;
  handleReset: () => void;
  handleExecute: () => void;
}) => {
  const orderedFormData = React.useMemo<Record<string, JsonValue>>(() => {
    return refSchemas.reduce<Record<string, JsonValue>>(
      (prevFormData, refSchema, index) => {
        const orderedStapFormData = Object.keys(
          refSchema.properties || {},
        ).reduce<Record<string, JsonValue>>(
          (prevStepForm, key) => ({
            ...prevStepForm,
            [key]: formDataObjects[index][key],
          }),
          {},
        );
        return { ...prevFormData, ...orderedStapFormData };
      },
      {},
    );
  }, [formDataObjects, refSchemas]);

  return (
    <Content>
      <Paper square elevation={0}>
        <Typography variant="h6">Review and execute</Typography>
        <StructuredMetadataTable dense metadata={orderedFormData} />
        <Box mb={4} />
        <Button onClick={handleBack} disabled={busy}>
          Back
        </Button>
        <Button onClick={handleReset} disabled={busy}>
          Reset
        </Button>
        <SubmitBtn handleClick={handleExecute} submitting={busy}>
          Run
        </SubmitBtn>
      </Paper>
    </Content>
  );
};

const StepperForm = ({
  refSchemas,
  handleExecute,
  isExecuting,
}: {
  refSchemas: JSONSchema7[];
  handleExecute: (
    getParameters: () => Record<string, JsonValue>,
  ) => Promise<void>;
  isExecuting: boolean;
}) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const handleBack = () => setActiveStep(activeStep - 1);

  const [formDataObjects, setFormDataObjects] = React.useState<
    Record<string, JsonValue>[]
  >([]);

  const getFormData = () =>
    formDataObjects.reduce<Record<string, JsonValue>>(
      (prev, curFormObject) => ({ ...prev, ...curFormObject }),
      {},
    );

  const resetFormDataObjects = React.useCallback(
    () =>
      setFormDataObjects(
        refSchemas.reduce<Record<string, JsonValue>[]>(
          prev => [...prev, {}],
          [],
        ),
      ),
    [refSchemas],
  );

  React.useEffect(() => {
    resetFormDataObjects();
  }, [resetFormDataObjects]);

  return (
    <>
      <Stepper activeStep={activeStep} orientation="vertical">
        {refSchemas.map((schema, index) => (
          <Step key={index}>
            <StepLabel
              aria-label={`Step ${index + 1} ${schema.title}`}
              aria-disabled="false"
              tabIndex={0}
            >
              <Typography variant="h6" component="h2">
                {schema.title}
              </Typography>
            </StepLabel>
            <StepContent>
              <MuiForm
                validator={validator}
                showErrorList={false}
                noHtml5Validate
                formData={formDataObjects[index]}
                schema={{ ...schema, title: '' }} // title is in step
                onSubmit={e => {
                  const newDataObjects = [...formDataObjects];
                  newDataObjects.splice(index, 1, e.formData || {});
                  setFormDataObjects(newDataObjects);
                  setActiveStep(activeStep + 1);
                }}
              >
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" color="primary" type="submit">
                  Next step
                </Button>
              </MuiForm>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === refSchemas.length && (
        <ReviewStep
          refSchemas={refSchemas}
          formDataObjects={formDataObjects}
          handleBack={handleBack}
          handleReset={() => {
            resetFormDataObjects();
            setActiveStep(0);
          }}
          busy={isExecuting}
          handleExecute={() => handleExecute(() => getFormData())}
        />
      )}
    </>
  );
};

export default StepperForm;
