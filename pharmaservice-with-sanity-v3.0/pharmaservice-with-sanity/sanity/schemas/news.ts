import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'news',
  title: 'News Updates',
  type: 'document',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'headline',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'MOHAP', value: 'mohap' },
          { title: 'Dubai Health Authority', value: 'dha' },
          { title: 'EDE', value: 'ede' },
          { title: 'Industry News', value: 'industry' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'content',
      title: 'Full Content',
      type: 'array',
      of: [{ type: 'block' }]
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      description: 'Link to official announcement or source'
    }),
    defineField({
      name: 'important',
      title: 'Mark as Important',
      type: 'boolean',
      initialValue: false,
      description: 'Highlight this update'
    })
  ],
  preview: {
    select: {
      title: 'headline',
      subtitle: 'source'
    }
  }
})
