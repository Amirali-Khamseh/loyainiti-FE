import React, { useState } from "react";
import { ScrollView, View, Pressable, Image } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Coffee, Star } from "lucide-react-native";
import { api } from "../../src/lib/api";
import { auth } from "../../src/lib/auth";
import { r2Url } from "../../src/lib/media";
import { Card } from "../../src/components/Card";
import { Typo } from "../../src/components/Heading";
import { tokens } from "../../src/design-system/tokens";

type Category = { id: string; name: string; slug: string };
type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoR2Key: string | null;
  coverR2Key: string | null;
  ratingAvg?: number | null;
  ratingCount?: number;
  categories: Category[];
};
type Membership = {
  membershipId: string;
  business: { id: string; slug: string; name: string };
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | {
    requiredVisits: number;
    rewardDescription: string;
    rewardEligible: boolean;
  };
};

export default function Explore() {
  const router = useRouter();
  const { data: session } = auth.useSession();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<Category[]>("/api/categories"),
  });
  const businesses = useQuery({
    queryKey: ["businesses", activeCategory],
    queryFn: () =>
      api<Business[]>(
        `/api/businesses${activeCategory ? `?category=${activeCategory}` : ""}`,
      ),
  });
  const memberships = useQuery({
    queryKey: ["my-memberships"],
    queryFn: () => api<Membership[]>("/api/me/memberships"),
    enabled: !!session,
  });

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>
          The Network
        </Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          Hi {session?.user?.name?.split(" ")[0] ?? "there"}
        </Typo>
        <Typo
          variant="bodyLg"
          color={tokens.colors.fg2}
          style={{ marginTop: 8 }}
        >
          One QR code, every coffee.
        </Typo>
      </View>

      {/* Category filter chips */}
      {(categories.data?.length ?? 0) > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          <FilterChip
            label="All"
            active={activeCategory === null}
            onPress={() => setActiveCategory(null)}
          />
          {categories.data?.map((c: Category) => (
            <FilterChip
              key={c.id}
              label={c.name}
              active={c.slug === activeCategory}
              onPress={() =>
                setActiveCategory(c.slug === activeCategory ? null : c.slug)
              }
            />
          ))}
        </ScrollView>
      )}

      {session && (memberships.data?.length ?? 0) > 0 && !activeCategory && (
        <View>
          <Typo variant="h2" style={{ marginBottom: 12 }}>
            Your shops
          </Typo>
          <View style={{ gap: 12 }}>
            {memberships.data?.map((m: Membership) => (
              <Pressable
                key={m.membershipId}
                onPress={() =>
                  router.push(`/(customer)/shop/${m.business.slug}` as const)
                }
              >
                <Card>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Coffee color={tokens.colors.action} size={20} />
                    <Typo variant="h3">{m.business.name}</Typo>
                  </View>
                  <Typo
                    variant="bodySm"
                    color={tokens.colors.fg2}
                    style={{ marginTop: 6 }}
                  >
                    {m.totalVisits} visits total
                  </Typo>
                  {m.program && (
                    <View style={{ marginTop: 12 }}>
                      <View
                        style={{
                          height: 8,
                          backgroundColor: tokens.colors.paper200,
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.min(
                              100,
                              (m.visitsSinceLastRedemption /
                                m.program.requiredVisits) *
                                100,
                            )}%`,
                            height: "100%",
                            backgroundColor: m.program.rewardEligible
                              ? tokens.colors.success
                              : tokens.colors.gold500,
                          }}
                        />
                      </View>
                      <Typo
                        variant="caption"
                        color={tokens.colors.fg2}
                        style={{ marginTop: 6 }}
                      >
                        {m.program.rewardEligible
                          ? "Reward ready!"
                          : `${m.visitsSinceLastRedemption} / ${m.program.requiredVisits} - ${m.program.rewardDescription}`}
                      </Typo>
                    </View>
                  )}
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View>
        <Typo variant="h2" style={{ marginBottom: 12 }}>
          {activeCategory
            ? `${categories.data?.find((c: Category) => c.slug === activeCategory)?.name ?? ""} shops`
            : "All shops"}
        </Typo>
        <View style={{ gap: 12 }}>
          {businesses.isLoading && (
            <Typo variant="body" color={tokens.colors.fg3}>
              Loading shops…
            </Typo>
          )}
          {businesses.error && (
            <Typo variant="body" color={tokens.colors.danger}>
              Couldn't load shops: {(businesses.error as Error).message}
            </Typo>
          )}
          {businesses.data?.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => router.push(`/(customer)/shop/${b.slug}` as const)}
            >
              <Card>
                <Typo variant="h3">{b.name}</Typo>
                <Typo
                  variant="bodySm"
                  color={tokens.colors.fg2}
                  style={{ marginTop: 6 }}
                >
                  {b.description ?? "A new shop in the network."}
                </Typo>
              </Card>
            </Pressable>
          ))}
          {businesses.data?.length === 0 && (
            <Typo variant="body" color={tokens.colors.fg3}>
              No published shops{activeCategory ? " in this category" : ""} yet.
            </Typo>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active
          ? tokens.colors.action
          : tokens.colors.borderDefault,
        backgroundColor: active
          ? tokens.colors.actionSubtleBg
          : tokens.colors.bgCard,
      }}
    >
      <Typo
        variant="bodySm"
        color={active ? tokens.colors.actionSubtleFg : tokens.colors.fg2}
        style={{ fontWeight: "500" }}
      >
        {label}
      </Typo>
    </Pressable>
  );
}
