#### Introduction
Today, I want to talk about paper “Galactica”, it was one of the earliest pre-ChatGPT and GPT-4 papers and way before the AI craze was a real activity and people gained attention through it. Galactica is an odd paper because it debunks and criticizes the most popular understanding and training strategy of language models. 

Including these lectures taught at Stanford University on Large Language Models. ([CITE 1](https://www.youtube.com/watch?v=9vM4p9NN0Ts&t=4713s)) 

Before we dive-deep, it is important to understand Galactica didn’t come to fuel now poplar belief of scaling through large unstructured pre-training corpus neither how you should use instruction based fine-tuning and many fancy param increase, compute increase and then subsequently finding emerging qualities like reasoning. Rather Galactica came to establish a few factors:

1. A mixture of Supervised and Unsupervised pre-training strategy is required to beat SOTA built on Unsupervised training paradigm SOTA. SFT (Supervised Fine-tuning is overrated)
2. Zero-shot capability is what you should aim for. 
3. COT is fine, but you can rather use **special tokens** to have reasoning capabilities. 
4. Having high-quality and well-done pre-training corpus matters over rushed large token corpuses
5. Better Scaling laws while considering arguments such as fresh Vs repeated tokens
6. Offloading exhaustive calculations to python natively
7. Really multi-modal

Above contributions including factors such as robust metrics, finding of overfitting at fifth epoch and ensuring accurate generation makes Galactica a timeless and impactful contribution. 

In the later part, I will discuss these listed seven factors and go over the training code slightly because it is really interesting. If you're not an advanced individual I advise you drop-off from here. 

#### Dataset and Modelling
It is unknown what dataset was actually used and how it looks in flesh. But, we have some rough understanding and info. Like

1. It was trained on 48 million scientific research papers
2. A dataset size 106B (billion) was used
3. Quality was a huge priority hence it was heavily filtered and fixed
4. Provides a first concrete value of how much coding dataset should be present (7B tokens)

Modelling was done through special tokens. For each task a specific special token was used. For this article we are only interested over `work` tokens. 

If you are looking forward tokenizer name: It was BPE (Byte-pair Encoding) with a mix of sentence tokenizer at places. 

### Reasoning tokens `<work>`
Now, what's reasoning token, one might ask. Good question. Reasoning token is a better and grounded version of COT. Nowadays everyone is after overengineering COT and making Neural networks that are just predicting next token to force them to do mathematics and what not. 

It can be seen an completely unnecessary and abuse of having a large compute budget. Galactica goes a bit far and provides reasonable arguments why COT is not a good idea:

1. You need to generate large amounts of step-by-step reasoning and mimic human reasoning steps. In theory good but hard to replicate as humans have intermediate reasoning steps that are hidden and done in memory. On internet what you see is just a formulation of principal reasoning steps. and not including auxiliary reasoning steps means you can never achieve human par. 
2. Why we are thinking of solving all problems such as mathematics through forward pass? We are just diverting from what computers are made for which is performing calculation. Shouldn't we just offload maths calculation to CPU and call it day. Because it is so much finer and easy. 

Galactica invented `work` token to form an external memory where you incorporate reasoning steps method of COT and at time offload calculations on maths to machine and call it a day and the combine the result to answer posed question. 

While talking about this, Galactica makes a nice prediction for future here. It says in longer term we require a form of adaptive computation strategy just like [PonderNet](https://t.co/32ZnN5bCmM) 

I think people already realised, we have seen PonderNet in action through OpenAI's O3 model. 

**Galactica calls their forward-pass combined with machine offloading ***Model-Machine Symbiosis*** 

#### Pre-training
Coming to PRE-Training, it is often standard practice to train models on uncharted internet in unstructured fashion and later following with a SFT (Supervised Fine-tuning). Belief is that, while Pre-training is the phase where learning happens due to transformers robust mapping system;

SFT is where you condition it for a specific case like you condition the learned knowledge for something either be MCQA, General Knowledge etc. 

Pre-training covers social media shitpostings to actual science papers. Idea is that it offers better perplexity. While, there are efforts like rule based systems and much more to clean and filter the bad parts still it is very poor in quality. 

Modern pre-training can be thought as weakly supervised pre-training where you have some sorta cleaning and filtering but rest are untouched so that it can learn humans and its preferences. And can perform out-of-distribution tasks. 

Modern Pre-training comes with different flavours and recipes. Nowadays we have COT based pre-training as well. While new tricks are available traditional pre-training is still mainstream. 

It is Unsupervised in nature due to its scalability. Including how combination of RL algorithms can make it condition to a task in few shot settings. I won't dive deep since it is not the scope here. 

We were talking about Galactica and this pretext was necessary to compare why Galactica pre-training is a masterpiece and gold-mine. 

Galactica does not bring new ideas as such they were the ones inventing these rather they bring learned lessons from training smaller and more constrained architecture where prompt based pre-training corpus resulted in surpassing that time GPT-3. 

Which is a big deal because those models like T0 were not scaled or as large as GPT-3. Also, we are not talking about same architecture as well. These quite world apart. **Below are the 3 important lessons from Galactica:**

1. Prompt Pre-training 
2. General Corpora

***Prompt Pre-training*** a method where you have diverse set of prompts specified for the task you already think will be downstreamed. Core idea here is simple, we already know what tasks we want to use the model thus we are conditioning it on them during pre-training phase. 

While this is a clever technique to make a concrete zero-shot model that works without any domain specific few shot or large scale fine-tuning. 

Adding General Corpora is the unsupervised part of the training process where the model learns World knowledge. World knowledge means all the representation of the dataset and modalities. 

Combining both process **Prompt Pre-training** and **Vanilla Pre-training** adds the benefit of a supervised and unsupervised training process that makes a strong zero-shot model which was the goal of Galactica. 

Although, Galactica creators are very specific **instruction tuning** is still a strong strategy since it makes the model learn diverse and unknown tasks. Honestly, a personal remark is that while Prompt Pre-training and General Corpora is strong but you need a level of instruction tuning but you need to identify the correct recipe for that. 

#### Model Architecture
I tend to skip this part since most are generic or I don't find them interesting enough to explain but Galactica is quite fun. I have taken a look at the code too. 

1. It uses GeLU activations
2. Context window 2048 to fit enough text for the model to understand our scientific query
3. No bias in the dense kernels like PaLM model from Google. 
4. It had a modest 50K vocab that was created by using 2% of the randomly sampled training data. 
5. No embedding dropout layer was used
6. Larger warmup phase was observed to prevent slow learning phase. 

**training info**
It was trained on 120 A100 GPU 80GB cards. Inference of 120B model can be done in single A100 80GB card. 

#### Finding of result
![image](https://github.com/user-attachments/assets/c86ca8a3-9e28-4824-8d9d-974ea5dbcbd8)
If we see this graph, we can observe if tokens are repeated (450B tokens) for 4.25 epochs we can see that there's no sign of overfitting over the course of time except for fifth epoch in 120B model. 

To debunk accuse of being overfitted Galactica provides us benchmark where they evaluated their models on Big Bench subset: a general knowledge benchmark for which the model was not designed and it shows improved performance. Meaning, Prompt pre-training and repetition of tokens did not make the model a dumb parrot i.e. did not overfit. 

![image](https://github.com/user-attachments/assets/dd579109-7908-4b52-b2b7-4af69e2cd7b3)
*Galactica Graph for Big bench subset results while training.* 

![image](https://github.com/user-attachments/assets/1bdb86cb-eec5-499c-bb13-9073c3072d91)

![image](https://github.com/user-attachments/assets/0d56e669-9bfc-4b04-b29f-c9bd749881f8)

Above result sheets are a proof how competitive and strong Galactica models are term of providing concrete results for Maths while delivering these less amounts of params. If you compare Galactica and PaLM side by side PaLM is a very bad model judging its 540B param size. 

##### Future of Galactica
It is a shame why Galactica is not studied enough because if you judge raw param size and how small corpus it was trained on including factors such as it does so many modalities with strong generalisation in zero-shot. It is surprising why it is not trickled and not talked. 

I identify 2 major factors
1. We just don't know whether closed models like Claude and GPT-4 doing. Maybe they have already cracked Galactica. 
2. Solving language models from Galactica perspective is less interesting of a problem because everyone is so invested with overengineering and thinking we need more and more fresh tokens. That's a big reason why Galactica type models are understudied. 

**Note:** I obviously won't talk in detail what can be done more since it makes me lose my advantage if I plan to have a paper. But, these two factors are only reason why we don't have more Galactica. 

> Comments
> Please, don't consider this to be a concreate bible. I have written this in less than 3 hours because I wanted to teach and talk about this paper. It is not possible to cover each part of Galactica in detail. Obviously competitive advantage is a factor but if I just explain pre-training I have to study and read about Pre-training in detail and draw conclusions for Galactica that being 2 hours worth lecture material. Not possible. 
> 
> Why did not talk about code? 
> I realised late in writing they don't provide exact code of the model just enough to have inference. From surface Galactica is likely a transformers with special tokens. Not a very fancy thing. Special modifications are obviously needed if you add more modalities. But, barebone is simple. 
> 
> I advise please read and spend understanding the original paper. Because reading papers is a good habit. Use this article, to understand the key-takeaways. 

**Paper link:** https://arxiv.org/pdf/2211.09085

**repo:** https://github.com/paperswithcode/galai
