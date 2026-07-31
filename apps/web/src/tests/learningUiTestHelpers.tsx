import {
  act,
  fireEvent,
  render,
  screen,
  within,
  type RenderResult,
} from '@testing-library/react';
import { expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { Layout } from '../components/Layout';
import { TRAINEE_HOME_PATH } from '../domain/appPaths';
import {
  LEARNING_ADD_LINK_LABEL,
  LEARNING_CREATE_PATH,
  LEARNING_CREATE_REGION_LABEL,
  LEARNING_CREATE_SUCCESS_MESSAGE,
  LEARNING_FEED_PATH,
  LEARNING_HEADER_NAV_LABEL,
  LEARNING_INVALID_URL_MESSAGE,
  LEARNING_TITLE_REQUIRED_MESSAGE,
  type LearningPostResponse,
} from '../domain/learningForm';
import { LearningCreatePage } from '../pages/LearningCreatePage';
import { LearningFeedPage } from '../pages/LearningFeedPage';
import { TraineeHomePage } from '../pages/TraineeHomePage';
import {
  clearAuthSession,
  setTraineeSession,
  setTrainerSession,
} from './reportAuthTestHelpers';

export { clearAuthSession, setTraineeSession, setTrainerSession };

export const U_L23_SAMPLE_POSTS: readonly LearningPostResponse[] = [
  {
    id: 'learning-u-l23-1',
    authorId: 'trainee-1',
    date: '2026-07-30',
    title: 'TypeScript の型推論',
    body: 'interface と type の使い分けを学んだ。',
    links: [
      {
        url: 'https://www.typescriptlang.org/docs/',
        label: 'TypeScript 公式',
      },
    ],
    createdAt: '2026-07-30T10:00:00.000Z',
    updatedAt: '2026-07-30T10:00:00.000Z',
  },
  {
    id: 'learning-u-l23-2',
    authorId: 'trainee-1',
    date: '2026-07-29',
    title: 'React Hooks',
    body: 'useEffect の依存配列について復習した。',
    links: [],
    createdAt: '2026-07-29T10:00:00.000Z',
    updatedAt: '2026-07-29T10:00:00.000Z',
  },
];

function renderLearningRoutes(
  initialPath: string,
  session: () => void,
): RenderResult {
  session();

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path={TRAINEE_HOME_PATH} element={<TraineeHomePage />} />
            <Route path={LEARNING_FEED_PATH} element={<LearningFeedPage />} />
            <Route
              path={LEARNING_CREATE_PATH}
              element={<LearningCreatePage />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

export async function renderTraineeLearningNavigation(
  initialPath = TRAINEE_HOME_PATH,
): Promise<RenderResult> {
  const view = renderLearningRoutes(initialPath, setTraineeSession);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

export async function renderTrainerLearningNavigation(
  initialPath = LEARNING_FEED_PATH,
): Promise<RenderResult> {
  const view = renderLearningRoutes(initialPath, setTrainerSession);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

export function expectTraineeHeaderLearningNav(): void {
  expect(
    screen.getByRole('link', { name: LEARNING_HEADER_NAV_LABEL }),
  ).toBeTruthy();
}

export function expectTrainerHeaderLearningNav(): void {
  expect(
    screen.getByRole('link', { name: LEARNING_HEADER_NAV_LABEL }),
  ).toBeTruthy();
}

export function expectLearningFeedVisible(): void {
  expect(
    screen.getByRole('heading', { name: '学びタイムライン' }),
  ).toBeTruthy();
}

export function expectLearningPostsVisible(
  posts: readonly LearningPostResponse[],
): void {
  for (const post of posts) {
    expect(screen.getByText(post.title)).toBeTruthy();
    expect(screen.getByText(post.body)).toBeTruthy();
    const [year, month, day] = post.date.split('-');
    expect(
      screen.getByText(`${Number(year)}年${Number(month)}月${Number(day)}日`),
    ).toBeTruthy();
    for (const link of post.links) {
      expect(
        screen.getByRole('link', {
          name: link.label ?? new URL(link.url).hostname,
        }),
      ).toBeTruthy();
    }
  }
}

export async function fillLearningForm(values: {
  title?: string;
  body?: string;
  date?: string;
  linkUrl?: string;
  linkLabel?: string;
}): Promise<void> {
  const form = screen.getByRole('form', { name: LEARNING_CREATE_REGION_LABEL });

  if (values.title !== undefined) {
    fireEvent.change(within(form).getByLabelText('タイトル'), {
      target: { value: values.title },
    });
  }
  if (values.body !== undefined) {
    fireEvent.change(within(form).getByLabelText('学んだ内容'), {
      target: { value: values.body },
    });
  }
  if (values.date !== undefined) {
    fireEvent.change(within(form).getByLabelText('投稿日'), {
      target: { value: values.date },
    });
  }
  if (values.linkUrl !== undefined) {
    if (screen.queryByLabelText('URL') === null) {
      fireEvent.click(
        screen.getByRole('button', { name: LEARNING_ADD_LINK_LABEL }),
      );
    }
    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: values.linkUrl },
    });
  }
  if (values.linkLabel !== undefined) {
    fireEvent.change(screen.getByLabelText('ラベル（任意）'), {
      target: { value: values.linkLabel },
    });
  }
}

export async function submitLearningCreateForm(): Promise<void> {
  const form = screen.getByRole('form', { name: LEARNING_CREATE_REGION_LABEL });
  fireEvent.submit(form);
  await act(async () => {
    await Promise.resolve();
  });
}

export function expectLearningFormValidationError(message: string): void {
  expect(screen.getByRole('alert').textContent).toBe(message);
}

export async function waitForLearningSuccessMessage(
  message: string,
): Promise<void> {
  expect(
    await screen.findByRole('status', {
      name: message,
    }),
  ).toBeTruthy();
}

export function expectLearningCreateLinkAbsent(): void {
  expect(screen.queryByRole('link', { name: '学びを投稿' })).toBeNull();
}

export {
  LEARNING_CREATE_SUCCESS_MESSAGE,
  LEARNING_INVALID_URL_MESSAGE,
  LEARNING_TITLE_REQUIRED_MESSAGE,
};
