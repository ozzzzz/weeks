"use client";

import { Button, CopyButton, Modal, ScrollArea, Stack, Text, Textarea } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

const PROMPT_TEMPLATE = `To generate a life calendar for me, please:
1. Use my birthday: [YOUR BIRTHDAY]
2. Extract key life events and periods from one or more of these sources:
   - My LinkedIn profile: [YOUR LINKEDIN URL]
   - My CV / resume (paste it below)
   - Any other biographical info I provide
3. Return a JSON object in this exact format:

{
  "profile": {
    "name": "Your Full Name",
    "dateOfBirth": {
      "year": 1993,
      "month": 1,
      "day": 30
    },
    "realExpectancyYears": 80,
    "extraExpectancyYears": 20
  },
  "calendars": [
    {
      "id": "unique-string",
      "name": "Calendar Name",
      "events": [
        {
          "id": "unique-string",
          "label": "Graduated university",
          "date": {
            "year": 2014,
            "month": 6,
            "day": 20
          },
          "color": "#ef4444"
        },
        {
          "id": "unique-string",
          "label": "Started first job",
          "date": {
            "year": 2014,
            "month": 9
          },
          "color": "#3b82f6"
        }
      ],
      "periods": [
        {
          "id": "unique-string",
          "label": "University",
          "start": {
            "year": 2010,
            "month": 9
          },
          "end": {
            "year": 2014,
            "month": 6
          },
          "color": "#8b5cf6"
        }
      ],
      "isVisible": true
    }
  ],
  "activeCalendarId": "unique-string",
  "isMenuCollapsed": false,
  "viewMode": "weeks"
}

Notes on dates:
- "year" is required
- "month" is optional (1 = January, 12 = December)
- "day" is optional`;

type Props = {
  opened: boolean;
  onClose: () => void;
};

const GenerateCalendarModal = ({ opened, onClose }: Props) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Generate Calendar with AI"
      size="90%"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        <Text size="sm">
          To generate a calendar automatically, copy the prompt below and paste
          it into any LLM (ChatGPT, Claude, Gemini, etc.):
        </Text>

        <CopyButton value={PROMPT_TEMPLATE}>
          {({ copied, copy }) => (
            <Button
              leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              variant="light"
              color={copied ? "green" : "dark"}
              size="xs"
              onClick={copy}
              w="fit-content"
            >
              {copied ? "Copied!" : "Copy prompt"}
            </Button>
          )}
        </CopyButton>

        <Textarea
          value={PROMPT_TEMPLATE}
          readOnly
          autosize
          minRows={10}
          styles={{ input: { fontFamily: "monospace", fontSize: 13 } }}
        />
      </Stack>
    </Modal>
  );
};

export default GenerateCalendarModal;
