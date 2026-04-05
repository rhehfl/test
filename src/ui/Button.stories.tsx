// src/components/ui/Button/Button.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'ghost', 'surface', 'danger', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

// Controls 패널에서 모든 props 조작 가능
export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: '검색',
  },
};

// 실제 시안에서 쓰이는 버튼 전체를 한 화면에서 확인
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">검색</Button>
      <Button variant="ghost">원정대 보기</Button>
      <Button variant="surface">필터</Button>
      <Button variant="danger">신고</Button>
      <Button variant="link">전체 보기 →</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button variant="primary" size="sm">
        소형
      </Button>
      <Button variant="primary" size="md">
        중형
      </Button>
      <Button variant="primary" size="lg">
        대형
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button variant="primary">기본</Button>
      <Button variant="primary" loading>
        로딩 중
      </Button>
      <Button variant="primary" disabled>
        비활성화
      </Button>
    </div>
  ),
};

// 캐릭터 히어로 패널에서 쓰이는 조합 그대로
export const HeroActions: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="primary">새로고침</Button>
      <Button variant="ghost">원정대 보기</Button>
      <Button variant="ghost">공유</Button>
    </div>
  ),
};

// 아이콘 버튼 (topbar)
export const IconButton: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="ghost" size="icon">
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3 3" />
        </svg>
      </Button>
      <Button variant="ghost" size="icon">
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M8 2a5 5 0 0 1 5 5v2l1 2H2l1-2V7a5 5 0 0 1 5-5z" />
        </svg>
      </Button>
    </div>
  ),
};
