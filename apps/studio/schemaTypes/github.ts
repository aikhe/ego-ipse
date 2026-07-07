import {defineType, defineField} from 'sanity'

export default defineType({
  title: 'GitHub Config',
  name: 'github',
  type: 'document',
  fields: [
    defineField({
      title: 'Name',
      name: 'name',
      type: 'string',
      validation: (Rule) => [
        Rule.required().error('Name is required'),
        Rule.min(1).error('Name must be at least 1 character'),
        Rule.max(100).error('Name cannot exceed 100 characters'),
      ],
    }),
    defineField({
      title: 'URL',
      name: 'href',
      type: 'url',
      validation: (Rule) => [
        Rule.required().error('URL is required'),
        Rule.uri({
          scheme: ['http', 'https'],
        }).error('Must be a valid URL (http/https)'),
      ],
    }),
    defineField({
      title: 'External Link',
      name: 'external',
      type: 'boolean',
      description: 'Open in new tab?',
      initialValue: true,
      validation: (Rule) => Rule.required().error('Required'),
    }),
    defineField({
      title: 'Handle',
      name: 'handle',
      type: 'string',
      description: 'GitHub username (e.g. aikhe)',
      validation: (Rule) => Rule.required().error('Handle is required'),
    }),
    defineField({
      title: 'Bio Prefix',
      name: 'bioPrefix',
      type: 'string',
      description: 'Short label before the bio highlight (e.g. OS, DEV)',
      validation: (Rule) => Rule.max(20).warning('Should be under 20 characters'),
    }),
    defineField({
      title: 'Bio Highlight',
      name: 'bioHighlight',
      type: 'string',
      description: 'Catchphrase or bio line',
      validation: (Rule) => Rule.max(100).warning('Should be under 100 characters'),
    }),
    defineField({
      title: 'Tags',
      name: 'tags',
      type: 'array',
      of: [
        {
          type: 'string',
          validation: (Rule) => [
            Rule.min(1).error('Tag must be at least 1 character long'),
            Rule.max(50).error('Tag cannot exceed 50 characters'),
          ],
        },
      ],
    }),
    defineField({
      title: 'Status',
      name: 'status',
      type: 'string',
      description: 'Status text shown on hover card (e.g. PUSHING..., ACTIVE...)',
      validation: (Rule) => Rule.max(50).warning('Should be under 50 characters'),
    }),
    defineField({
      title: 'Icon Image',
      name: 'image',
      type: 'image',
      description: 'GitHub avatar / icon image',
      validation: (Rule) => Rule.required().error('Icon image is required'),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'handle',
      media: 'image',
    },
  },
})
