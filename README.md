<div align="center">

# CRISP: Fixing Flying Pixels in Latent LiDAR Generation via Diffusion Decoding

**[Andrea Ceron](https://github.com/andrea25512)<sup>1,2</sup> · Michael Schmidt<sup>2</sup> · Alvaro Marcos-Ramiro<sup>2</sup> · Sebastian Schmidt<sup>1,2</sup> · Benjamin Busam<sup>1</sup>**

<sup>1</sup>Technical University of Munich &nbsp;&nbsp; <sup>2</sup>BMW AG

**NeurIPS 2026** (Poster, Main Track)

[![Project Page](https://img.shields.io/badge/Project-Page-1f72b8?style=for-the-badge)](https://andrea25512.github.io/CRISP/)
[![Paper](https://img.shields.io/badge/Paper-PDF-b31b1b?style=for-the-badge)](https://andrea25512.github.io/CRISP/static/paper.pdf)
[![arXiv](https://img.shields.io/badge/arXiv-2610.11376-b31b1b?style=for-the-badge)](https://arxiv.org/abs/2610.11376)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-TBA-lightgrey?style=for-the-badge)](#)

<img src="static/teaser_full.svg" width="70%" alt="CRISP teaser (paper Figure 1): ground truth (blue), baseline VAE decoder (green) and CRISP (red)">

</div>

## 🚧 Code and checkpoints: TBA

> [!NOTE]
> **Code and pretrained checkpoints are coming soon.**
> Star or watch this repository to be notified when they are released.

| | Status |
|---|---|
| Paper | ✅ [Project page](https://andrea25512.github.io/CRISP/) |
| Training and inference code | ⏳ TBA |
| Pretrained checkpoints (SVD, Wan2.1, LiDM backbones) | ⏳ TBA ([Hugging Face](#)) |
| Evaluation scripts (FSVD / FPVD / FRID) | ⏳ TBA |

## Abstract

Latent LiDAR pipelines suffer from *flying pixels*: convolutional VAEs blur sharp radial depth discontinuities, yielding edge depths that back-project to points floating between surfaces. We identify this as a major, directly correctable decoder bottleneck and introduce **CRISP**: a pixel-space diffusion decoder with a backbone-agnostic latent adapter, DiT-based denoiser, and support mask predictor. CRISP replaces video-VAE and LiDAR-native decoders alike while keeping the encoder and latent generator fixed. Across KITTI-360, SemanticKITTI, and nuScenes, replacing only the decoder reduces FSVD/FPVD by 50.5% on average across frozen backbones; for generic video VAEs, the reductions reach 71%/74%. On the LiDAR-native LiDM backbone, FRID drops by 71%, with the largest gains at depth discontinuities. In a pretrained LiDM world model, the same zero-shot replacement improves FSVD by 15.5%, narrowing the sim-to-real gap.

## Method

CRISP keeps the encoder and the latent generator frozen and replaces only the decoder. It has three parts:

- **Latent adapter**: maps the frozen encoder's latent, from any backbone, to a common sequence of conditioning tokens.
- **DiT pixel-diffusion decoder**: denoises directly in range-map space into a dense depth map. The latent tokens enter early and again at the network midpoint.
- **Support mask predictor**: decides which pixels hold a valid LiDAR return, so the output is sparse like a real scan.

## Results

| | |
|---|---|
| **−50.5%** | average FSVD/FPVD across frozen backbones |
| **71% / 74%** | FSVD/FPVD reduction on generic video VAEs |
| **−71%** | FRID on LiDM |
| **−15.5%** | world-model FSVD, zero-shot decoder swap |

See the [project page](https://andrea25512.github.io/CRISP/) for videos and interactive comparisons, and the paper for the full tables, ablations and limitations.

## Citation

```bibtex
@inproceedings{ceron2026crisp,
  title     = {CRISP: Fixing Flying Pixels in Latent LiDAR Generation via Diffusion Decoding},
  author    = {Ceron, Andrea and Schmidt, Michael and Marcos-Ramiro, Alvaro and Schmidt, Sebastian and Busam, Benjamin},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  year      = {2026}
}
```
