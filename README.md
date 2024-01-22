# CU DBMI Wall of Software

[✨ **VIRTUAL WALL**](https://CU-DBMI.github.io/wall-of-software) (website)

[🏫 **PHYSICAL WALL**](https://maps.app.goo.gl/ZKt1W6Q7QHqAmKkMA) (AHSB, 6th floor)

The [Department of Biomedical Informatics (DBMI)](https://medschool.cuanschutz.edu/dbmi) investigates complex problems in medicine and biology using integrated computational technology. [Learn more](https://medschool.cuanschutz.edu/dbmi/about-us).

This wall exists to **appreciate** and **take pride** in the large collection of tools, packages, workflows, resources, and other **software** developed in the department, and the diverse **groups** of researchers, scientists, and collaborators that develop them.

This repository is managed by the department's [Software Engineering Team](https://cu-dbmi.github.io/set-website/about/).

## Submit

If you work for or with the department, you are eligible to submit here.

You may submit a...

- 💻 **Software** - tool, package, workflow, resource, etc.
- 🥼 **Group** - lab, organization, etc.

...To be displayed as a ⬢ hexagon...

- ✨ **Virtually** - on the [website](https://CU-DBMI.github.io/wall-of-software) in this repo.
- 🏫 **Physically** - window cling sticker on the 6th floor of the [AHSB](https://maps.app.goo.gl/ZKt1W6Q7QHqAmKkMA).

The order of entries on the website is shuffled randomly on each page visit to not favor any particular software/group.

### Process

1. [Fork this repo and open a pull request](https://github.dev/CU-DBMI/wall-of-software) (PR) with one or more changes.
1. Shortly after opening the PR, a link will appear that shows a preview of the website with your changes (if any).
1. We will review your changes, discuss or help you with them if needed, and merge the PR when everything is ready.
1. Changes to the website will go live almost immediately, if any.
   We'll start ordering your stickers, if any.

### Changes

1. Add an entry to **the top** of `software.json` / `groups.json`.
   - Short ~3-20 character **name**.
   - Short ~20-80 character **description**.
   - **Link** to a website or repo.
1. Add a **website** image to `/images`.
   - Filename must be lowercase, kebab-case version of entry name, e.g. **Word Lapse** → `word-lapse`.
   - Must be a PNG with a `.png` extension.
   - Must be exactly 600 × 600 pixels.
     See `_template.png`.
1. Add a **printable** image to `/print`.
   - Filename must be lowercase, kebab-case version of entry name.
   - Must be a PNG with a `.png` extension.
   - Must be exactly 1200 × 1200 pixels (4" at 300dpi).
     See `_template.png`.

To remove/change entries, edit the above files as needed.

## Images

Images should meet the following standards:

- Unique, visually appealing logo or other graphical representation of your software/group.
- Not up-scaled, stretched, or otherwise blurry/noisy/distorted/etc.
  Ideally, start from an `.svg` version of your image, and [rasterize it](https://vincerubinetti.github.io/svg-to-png/) to the exact dimensions needed.
- Enough space around the main content for it to fit nicely inside a "pointy-top" hexagon.
  See the `_template.png` files.
- **Website** image ideally **doesn't** contain text.
  More visually appealing, more consistent, and website will already display the name text as needed.
- **Printable** image ideally **does** contain text so people can identify it.
- Not too visually "busy".
  Will it be discernible at at a distance/small size, or will it just look like noise?
  Simple shapes and colors look best.
  Small and clean text looks best.
- **Do not** cut out a hexagon or any other shape from the background.
  Let it cover the full dimensions of the image.
  The website/printing process will make the appropriate crop and hexagon cuts.
  If a special background shape is part of your image's inherent design, see if extending it fully looks okay, or ask for an exception to this guideline.

If in doubt, **look at other submissions on the wall** and try to be consistent with them.
