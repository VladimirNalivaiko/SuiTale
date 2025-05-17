  // ... existing code ...
  const handleSave = async () => {
    if (!currentAccount) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (!title) {
      toast.error("Please enter a title for your tale.");
      return;
    }
    if (!content) {
      // TODO: add proper validation for content, maybe check for empty block
      toast.error("Please add content to your tale.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    let coverWalrusUrl = defaultCoverImageUrl; // Use default if no cover is uploaded

    try {
      if (coverImageFile) {
        const formData = new FormData();
        formData.append('file', coverImageFile);
        // toast.info("Uploading cover image to Walrus...");
        const uploadResponse = await uploadCover(formData); // uploadCover now expects FormData
        if (uploadResponse && uploadResponse.url) {
          coverWalrusUrl = uploadResponse.url;
          toast.success("Cover image uploaded to Walrus successfully!");
        } else {
          throw new Error("Failed to upload cover image to Walrus or received an invalid response.");
        }
      }

      // Proceed with signing and publication
      const messageToSign = `SuiTale content upload authorization for user ${currentAccount.address}. Title: ${title}`;
      // toast.info("Please sign the message in your wallet to authorize publication.");
      const signedMessageResult = await signPersonalMessage({
        message: new TextEncoder().encode(messageToSign),
      });

      const initiatePublicationDto: FrontendInitiatePublicationDto = {
        userAddress: currentAccount.address,
        signature_base64: signedMessageResult.signature,
        signedMessageBytes_base64: Buffer.from(signedMessageResult.bytes).toString('base64'),
        publicKey_base64: Buffer.from(currentAccount.publicKey).toString('base64'),
        signatureScheme: currentAccount.chains[0].split(':')[1], // e.g., 'sui:ed25519' -> 'ed25519' for Ed25519
        title,
        content: JSON.stringify(content), // quill delta
        description: description || "", // Ensure description is not undefined
        coverImageWalrusUrl: coverWalrusUrl,
        mintPrice: mintPrice !== undefined ? mintPrice : 0,
        mintCapacity: mintCapacity !== undefined ? mintCapacity : 0,
        authorMintBeneficiary: authorMintBeneficiary || currentAccount.address,
        royaltyFeeBps: royaltyFeeBps !== undefined ? royaltyFeeBps : 0,
      };
      // console.log("Initiating publication with DTO:", initiatePublicationDto);
      // toast.info("Initiating publication on the backend...");

      await initiatePublication(initiatePublicationDto);

      toast.success("Tale publication process initiated successfully!");
      // TODO: navigate to the tale page or dashboard
      // router.push(`/tale/${response.id}`); // Assuming API returns the ID of the created tale
    } catch (error: any) {
      // ... existing code ...
    }
  };
  // ... existing code ...