import { Data } from 'dataclass';
import moment from 'moment';

import {
  extractWorkflowFormatFromUri,
  WorkflowOverview as RawWorkflowOverview,
  WorkflowFormat,
} from '@janus-idp/backstage-plugin-orchestrator-common';

const UNAVAILABLE = '---';

const formatDuration = (milliseconds: number): string => {
  let sec = Math.round(milliseconds / 1000);
  let min = 0;
  let hr = 0;
  if (sec >= 60) {
    min = Math.floor(sec / 60);
    sec %= 60;
  }
  if (min >= 60) {
    hr = Math.floor(min / 60);
    min %= 60;
  }
  if (hr > 0) {
    return `${hr} h`;
  }
  if (min > 0) {
    return `${min} min`;
  }
  if (sec > 0) {
    return `${sec} sec`;
  }
  return 'less than a sec';
};

class WorkflowOverview extends Data {
  id: string = '';
  name: string = '';
  lastTriggered: string = '';
  lastRunStatus: string = '';
  type: string = '';
  avgDuration: string = '';
  description: string = '';
  format: WorkflowFormat = 'yaml';
  static from(data: RawWorkflowOverview): WorkflowOverview {
    return WorkflowOverview.create<WorkflowOverview>({
      id: data.workflowId,
      name: data.name || UNAVAILABLE,
      lastTriggered: data.lastTriggeredMs
        ? moment(data.lastTriggeredMs).format('DD/MM/YY HH:mm:ss')
        : UNAVAILABLE,
      lastRunStatus: data.lastRunStatus || UNAVAILABLE,
      type: data.type || UNAVAILABLE,
      avgDuration: data.avgDurationMs
        ? formatDuration(data.avgDurationMs)
        : UNAVAILABLE,
      description: data.description || UNAVAILABLE,
      format: data.uri ? extractWorkflowFormatFromUri(data.uri) : 'yaml',
    });
  }
}

export default WorkflowOverview;
