# Mixture of Experts: Explained how Noam wrote it

#### Introduction
Recently Mixture of Experts (MoE) received widespread adoption and popularity and its for valid reasons how multiple networks can benefit to reach conclusion faster and better than a singular dense model. MoE is a not a new concept rather existed way before Google Brain team worked on it but Google Brain perfected it by solving the most pressing issues i.e. 

1. Distributed training and Batch Shrinking Problem 
2. Training all experts with a similar importance. 
3. Noisy Top-K gating function

I don't think I can add more explanation than what Noam wrote but I am bother to explain in much simpler terms about the fun factors of the paper. 

*Let's start!*

### What's a Mixture of Expert?
It is models within a model where multiple Neural Networks are present and a Gating layer determines while acting as Load balancer which part of the training data should be received by what X model. Imagine:

> X' Neural Network have N number of smaller Neural Networks (called experts) inside it and when a user asks Q (question), gating layer (G) determines which Neural Network i.e. E (expert) should receive it and thus the individual receive their answer (A). 

These expert Neural networks can be anything from Multilayer Perceptron to Transformers and number of experts can range from couple of hundreds to thousands. Mixture of Expert is rather a concept of Deep learning than an Architecture itself. 

**spoiler:** It was invented back in 1991. 

### I want to write 1991 paper and skip Noam (THE MIDDLE MAN)
Probably be my guest but I don't think any paper that came before Noam's masterpiece is worth reading because those were immature and Noam while describing why MoE is fantastic, he also delve into the fact: How we can fuckingly train it for thousands of Experts (E) and scale it. *Hush! There goes away my frustration to explain you my case* ✅👀

### Let's talk about the dataset
Not quite exciting, it was classic Noam and Ilya style and used an existing SOTA MT (Machine translation) dataset. Including Google Translate team's production test and development sets. 

### Coming to the exciting substance
**Shrinking Batch Problem**
Its a standard distributed computing problem where Noam wanted to keep the batch size super high and do model and data parallelism by having the standard layers in all devices and then train on them synchronous fashion. 

It may have training advantage aside from sheer computation advantage as pointed out by other similar papers of Radford on batching that showing a batch of inputs together leads to better feature capture than processing either in small batches or sequentially. 

**Training all experts in similar importance**
Its a problem similar to GANs where it reaches Nash equilibrium within a few examples by collapsing into a single point. And moving it around in infinite possibility around the low dimensional high-D manifold space doesn't look much practical and does not improve quality.

MoE before Noam faced a similar obstacle, where Gating network was factoring importance to a few experts and training them on most data or assigning larger weight data to a few experts and small weights of many examples to other experts (E'). Both are destructive. He solved this using **Importance loss function** which acts as a load balancer and determines all model gets same amount of data to be trained on. 

![image](https://github.com/user-attachments/assets/6775c5ac-b371-4bd6-bcb7-c40532f58112)

Going over the entire function is tedious while it is simple to understand. Gist will be: It assigns same importance to all experts by calculating the gating value batchwise that is fed to an expert during training. (that's how utilising a perfect full batch is important)

**Noisy Top-K gating function**
Its likely the best part of the paper aside from reading over appendix and learning more about the models and Google Neural Translation Architecture that came-out in 2016 and Noam's ambitions to train a trillion param LSTM model. (I have never seen something like this but Noam trained a 137B LSTM model) Please, let's take a break. 

![image](https://github.com/user-attachments/assets/d0781f74-3b07-4cb9-94f8-ade443e3f461)

Before Softmax of the gating function defined as *G* is taken, Noam applies a Gaussian noise and only takes top-K values and set rest of them to -infinity. Its an elegant function, not sure what I can explain here beyond what it is visible and Noam told. 

### We're at End
I love Noam's papers since these are so well-written and simple that I don't have any commentary except for explaining what I understood. I think reading his paper yourself is already enough and you don't need to read this blog. But, if you want a quick refresher and understand the important parts, I think this can help you. 

### Dropout and MoE: What's the catch?
Alex Krizhevsky pointed-out in AlexNet why using Dropout in Neural Network was helpful and each time performing inference, you're activating X different neurons than activating the entire model. He also argued this was a key component in the success of AlexNet. 

MoE is similar to that concept of Dropout but it breaks Neural networks and form a Tree algorithm style hierarchal system. Where you can have parent and many sub parent and child nodes and trees. and rather than increasing layers and making the model more deep, you can have same model a million times and increase the number of parameters. 

Both are amazing ideas and it is a shame that we are not exploring them to the finest. I have a love relationship with Dropout and anyday would love to see it in limelight. 

### Conclusion
Like Dr. House said:
> Solving Puzzles. **Saving lives is just collateral damage.**

*Please, read the original paper: https://openreview.net/pdf?id=B1ckMDqlg*

