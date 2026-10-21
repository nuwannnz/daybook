import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SampleCounter } from './sample-counter';

describe('SampleCounter', () => {
  it('counts clicks', async () => {
    const user = userEvent.setup();
    render(<SampleCounter />);

    await user.click(screen.getByRole('button', { name: 'Add one' }));

    expect(screen.getByRole('status')).toHaveTextContent('Count: 1');
  });
});
