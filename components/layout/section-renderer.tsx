import { Button } from "@/components/ui/button";
import Link from "next/link";
import { blocksService } from "@/services/blocks.service";
import { useState, useEffect } from "react";

export interface SectionData {
  type: 'hero' | 'content' | 'cta' | 'blocks';
  title?: string;
  subtitle?: string;
  content?: string;
  background?: string;
  columns?: number;
  button_text?: string;
  button_link?: string;
  alignment?: 'left' | 'center' | 'right';
  block_id?: number;
}

interface SectionRendererProps {
  section: SectionData;
}

function HeroSection({ section }: { section: SectionData }) {
  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: section.background || '#f8f9fa' }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {section.title && (
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            {section.title}
          </h1>
        )}
        {section.subtitle && (
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {section.subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

function ContentSection({ section }: { section: SectionData }) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[section.alignment || 'left'];

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {section.title && (
          <h2 className={`text-3xl font-bold mb-8 text-gray-900 ${alignmentClass}`}>
            {section.title}
          </h2>
        )}
        {section.content && (
          <div
            className={`prose prose-lg max-w-none ${alignmentClass}`}
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        )}
      </div>
    </section>
  );
}

function CTASection({ section }: { section: SectionData }) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[section.alignment || 'center'];

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className={`max-w-4xl mx-auto ${alignmentClass}`}>
        {section.title && (
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="text-xl text-gray-600 mb-8">
            {section.subtitle}
          </p>
        )}
        {section.button_text && section.button_link && (
          <Link href={section.button_link}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {section.button_text}
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
}

function BlocksSection({ section }: { section: SectionData }) {
  const [blockContent, setBlockContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlock() {
      if (!section.block_id) {
        setLoading(false);
        return;
      }

      try {
        const blocks = await blocksService.getBlocks();
        const block = blocks.find(b => b.data?.id === section.block_id);
        if (block?.data?.content) {
          setBlockContent(block.data.content);
        }
      } catch (error) {
        console.error('Error fetching block:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlock();
  }, [section.block_id]);

  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (!blockContent) {
    return null;
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blockContent }}
        />
      </div>
    </section>
  );
}

export function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} />;
    case 'content':
      return <ContentSection section={section} />;
    case 'cta':
      return <CTASection section={section} />;
    case 'blocks':
      return <BlocksSection section={section} />;
    default:
      return null;
  }
}