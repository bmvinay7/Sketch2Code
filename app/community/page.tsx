import { FlowchartCard, type FlowchartCardData } from "@/components/community/FlowchartCard";
import { LibraryFilters } from "@/components/community/LibraryFilters";

const demoCards: FlowchartCardData[] = [
  {
    id: "demo-two-sum",
    problem: "Two Sum with a nested scan",
    language: "python",
    shapeCount: 7,
    upvotes: 42,
    isVerified: false
  },
  {
    id: "demo-max",
    problem: "Find maximum element",
    language: "java",
    shapeCount: 5,
    upvotes: 31,
    isVerified: true
  }
];

export default function CommunityPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Community Library</p>
        <h1 className="mt-3 text-3xl font-black text-text-primary">Flowcharts worth studying</h1>
      </div>
      <LibraryFilters />
      {demoCards.length > 0 ? (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {demoCards.map((card) => (
            <div key={card.id} className="mb-4 break-inside-avoid">
              <FlowchartCard item={card} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-border p-10 text-center text-text-secondary">
          No published flowcharts match these filters yet.
        </div>
      )}
    </section>
  );
}
