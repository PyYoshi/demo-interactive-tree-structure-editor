import { measureRenders } from 'reassure';
import { EmptyTreeState } from '../../src/components/EmptyTreeState';

describe('EmptyTreeState Performance', () => {
  test('renders efficiently in initial state', async () => {
    await measureRenders(
      <EmptyTreeState onAddRootNode={() => {}} />
    );
  });

  test('renders efficiently with multiple instances', async () => {
    await measureRenders(
      <>
        <EmptyTreeState onAddRootNode={() => {}} />
        <EmptyTreeState onAddRootNode={() => {}} />
        <EmptyTreeState onAddRootNode={() => {}} />
      </>
    );
  });
});
