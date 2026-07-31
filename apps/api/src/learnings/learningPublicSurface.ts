export type {
  CreateLearningPostInput,
  LearningLink,
  LearningPost,
  ListLearningsQuery,
} from './learningTypes.js';

export {
  LEARNING_BODY_MAX_LENGTH,
  LEARNING_LINK_LABEL_MAX_LENGTH,
  LEARNING_LINKS_MAX_COUNT,
  LEARNING_TITLE_MAX_LENGTH,
} from './learningConstants.js';

export { createLearningPost, listLearnings } from './learningFacade.js';
