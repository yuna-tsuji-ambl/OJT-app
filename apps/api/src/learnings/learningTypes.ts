export interface LearningLink {
  url: string;
  label?: string;
}

export interface LearningPost {
  id: string;
  authorId: string;
  date: string;
  title: string;
  body: string;
  links: LearningLink[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLearningPostInput {
  title: string;
  body: string;
  date?: string;
  links?: LearningLink[];
}

export interface ListLearningsQuery {
  authorId?: string;
  from?: string;
  to?: string;
}
