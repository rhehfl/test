import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import CharacterSearchForm from '../../../components/CharacterSearchForm';
import { CharacterHeader, CharacterHeaderSkeleton } from '../../../components/CharacterHeader';
import { CharacterSidebar, type CharacterTab } from '../../../components/CharacterSidebar';
import { EquipmentTab, EquipmentTabSkeleton } from '../../../components/tabs/EquipmentTab';
import { EngravingsTab, EngravingsTabSkeleton } from '../../../components/tabs/EngravingsTab';
import { GemsTab, GemsTabSkeleton } from '../../../components/tabs/GemsTab';
import { SkillsTab, SkillsTabSkeleton } from '../../../components/tabs/SkillsTab';
import { getOrFetchCharacter, fetchAndCacheCharacter } from '../../../lib/fetchAndCache';
import { addRecent } from '../../../lib/characterStorage';

export const Route = createFileRoute('/char/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const [activeTab, setActiveTab] = useState<CharacterTab>('equipment');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['character', id],
    queryFn: () => getOrFetchCharacter(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.profile) {
      addRecent({
        name: data.profile.CharacterName,
        serverName: data.profile.ServerName,
        className: data.profile.CharacterClassName,
        itemAvgLevel: data.profile.ItemAvgLevel,
        characterImage: data.profile.CharacterImage ?? '',
      });
    }
  }, [data?.profile]);

  const handleRefresh = async () => {
    await fetchAndCacheCharacter(id);
    refetch();
  };

  return (
    <main>
      <CharacterSearchForm defaultValue={id} />

      {isLoading && (
        <div className="rounded-lg border border-border-default bg-bg-surface">
          <CharacterHeaderSkeleton />
          <div className="flex min-h-96">
            <div className="w-28 shrink-0 border-r border-border-default bg-bg-surface" />
            <div className="flex-1 p-6">
              <EquipmentTabSkeleton />
            </div>
          </div>
        </div>
      )}

      {isError && (
        <div className="mt-4 rounded-lg border border-border-default bg-bg-surface p-8 text-center">
          <p className="text-text-secondary">캐릭터를 찾을 수 없습니다.</p>
        </div>
      )}

      {data && data.profile && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border-default">
          <CharacterHeader
            profile={data.profile}
            updatedAt={data.updated_at}
            onRefresh={handleRefresh}
            isRefreshing={isFetching}
          />
          <div className="flex min-h-96">
            <CharacterSidebar activeTab={activeTab} onChange={setActiveTab} />
            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'equipment' && (
                data.equipment
                  ? <EquipmentTab equipment={data.equipment} />
                  : <EquipmentTabSkeleton />
              )}
              {activeTab === 'engravings' && (
                data.engravings
                  ? <EngravingsTab engravings={data.engravings} />
                  : <EngravingsTabSkeleton />
              )}
              {activeTab === 'gems' && (
                data.gems
                  ? <GemsTab gems={data.gems} />
                  : <GemsTabSkeleton />
              )}
              {activeTab === 'skills' && (
                data.skills
                  ? <SkillsTab skills={data.skills} />
                  : <SkillsTabSkeleton />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
