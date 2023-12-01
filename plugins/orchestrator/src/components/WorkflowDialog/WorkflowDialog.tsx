import React from 'react';

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { NewEditor } from '../WorkflowEditor/NewEditor';
import { useWorkflowEditor } from '../WorkflowEditor/use-workflow-editor';
import { WorkflowEditorView } from '../WorkflowEditor/WorkflowEditor';

type OrchestratorWorkflowDialogProps = {
  workflowId: string;
  title: string;
  open: boolean;
  close: () => void;
} & WorkflowEditorView;

const useStyles = makeStyles(_theme => ({
  closeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
}));

export const WorkflowDialog = (
  props: OrchestratorWorkflowDialogProps,
): JSX.Element | null => {
  const { workflowId, title, open, close } = props;
  const classes = useStyles();

  const { content, languageServer, workflowURI } =
    useWorkflowEditor(workflowId);

  return (
    <Dialog fullWidth maxWidth="lg" onClose={close} open={open}>
      <DialogTitle>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <IconButton
            className={classes.closeBtn}
            aria-label="close"
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {content && languageServer && workflowURI && (
          <NewEditor
            content={content}
            languageServer={languageServer}
            workflowURI={workflowURI}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
