'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useContractForm } from '@/hooks/useContractForm';

interface ContractFormProps {
  contractId: string;
  onSubmit?: (formData: Record<string, string>) => void;
}

type FieldType = 'text' | 'number' | 'date' | 'textarea';

interface FieldConfig {
  label: string;
  type: FieldType;
}

interface ContractConfig {
  title: string;
  fields: Record<string, FieldConfig>;
}

type ContractForms = Record<string, ContractConfig>;

const contractForms: ContractForms = {
  mpc: {
    title: 'Comprehensive Music Producer Contract Package',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      projectTitle: { label: 'Project Title', type: 'text' },
      numberOfTracks: { label: 'Number of Tracks', type: 'number' },
      advanceAmount: { label: 'Advance Amount ($)', type: 'number' },
      royaltyPercentage: { label: 'Royalty Percentage (%)', type: 'number' },
      publishingShare: { label: 'Publishing Share (%)', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      recordCompanyName: {
        label: 'Record Company Name (if applicable)',
        type: 'text',
      },
      territory: { label: 'Territory', type: 'text' },
      term: { label: 'Agreement Term', type: 'text' },
      mechanicalRoyaltyRate: {
        label: 'Mechanical Royalty Rate (if applicable)',
        type: 'number',
      },
      parentGuardianName: {
        label: 'Parent/Guardian Name (if artist is a minor)',
        type: 'text',
      },
      studioName: { label: 'Recording Studio Name', type: 'text' },
      studioRentalRate: {
        label: 'Studio Rental Rate ($ per hour)',
        type: 'number' },
      engineerName: { label: 'Recording Engineer Name', type: 'text' },
      engineerRate: { label: 'Engineer Rate ($ per hour)', type: 'number' },
      featuredArtistName: {
        label: 'Featured Artist Name (if applicable)',
        type: 'text',
      },
      featuredArtistCompensation: {
        label: 'Featured Artist Compensation ($)',
        type: 'number',
      },
      sideArtistName: {
        label: 'Side Artist Name (if applicable)',
        type: 'text',
      },
      sideArtistCompensation: {
        label: 'Side Artist Compensation ($)',
        type: 'number',
      },
      exclusivityTerms: { label: 'Exclusivity Terms', type: 'textarea' },
      creditLine: { label: 'Credit Line', type: 'text' },
      specialTerms: { label: 'Special Terms and Conditions', type: 'textarea' },
    },
  },
  fa1: {
    title: 'Featured Artist Agreement 1 (No Royalty/Song Rights)',
    fields: {
      featuredArtistName: { label: 'Featured Artist Name', type: 'text' },
      mainArtistName: { label: 'Main Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      compensationAmount: { label: 'Compensation Amount', type: 'number' },
      recordingDate: { label: 'Recording Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  fa2: {
    title: 'Featured Artist Agreement 2 (Royalty/No Song Rights)',
    fields: {
      featuredArtistName: { label: 'Featured Artist Name', type: 'text' },
      mainArtistName: { label: 'Main Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      royaltyPercentage: { label: 'Royalty Percentage', type: 'number' },
      advanceAmount: { label: 'Advance Amount', type: 'number' },
      recordingDate: { label: 'Recording Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  fa3: {
    title: 'Featured Artist Agreement 3 (Royalty/Song Rights)',
    fields: {
      featuredArtistName: { label: 'Featured Artist Name', type: 'text' },
      mainArtistName: { label: 'Main Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      royaltyPercentage: { label: 'Royalty Percentage', type: 'number' },
      songwritingShare: { label: 'Songwriting Share (%)', type: 'number' },
      advanceAmount: { label: 'Advance Amount', type: 'number' },
      recordingDate: { label: 'Recording Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  lod: {
    title: 'Letter of Direction (To Record Company)',
    fields: {
      artistName: { label: 'Artist Name', type: 'text' },
      recordCompanyName: { label: 'Record Company Name', type: 'text' },
      producerName: { label: 'Producer Name', type: 'text' },
      projectTitle: { label: 'Project Title', type: 'text' },
      paymentInstructions: { label: 'Payment Instructions', type: 'textarea' },
      date: { label: 'Date', type: 'date' },
    },
  },
  mul1: {
    title: 'Master Use License (Audiovisual Work)',
    fields: {
      licensorName: { label: 'Licensor Name', type: 'text' },
      licenseeName: { label: 'Licensee Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      projectTitle: { label: 'Audiovisual Project Title', type: 'text' },
      territory: { label: 'Territory', type: 'text' },
      term: { label: 'License Term', type: 'text' },
      fee: { label: 'License Fee', type: 'number' },
      usageDetails: { label: 'Usage Details', type: 'textarea' },
    },
  },
  mul2: {
    title: 'Master Use License (Compilation)',
    fields: {
      licensorName: { label: 'Licensor Name', type: 'text' },
      licenseeName: { label: 'Licensee Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      compilationTitle: { label: 'Compilation Title', type: 'text' },
      territory: { label: 'Territory', type: 'text' },
      term: { label: 'License Term', type: 'text' },
      fee: { label: 'License Fee', type: 'number' },
      royaltyRate: { label: 'Royalty Rate', type: 'number' },
    },
  },
  ml: {
    title: 'Mechanical License',
    fields: {
      licenserName: { label: 'Licenser Name', type: 'text' },
      licenseeName: { label: 'Licensee Name', type: 'text' },
      songTitle: { label: 'Song Title', type: 'text' },
      songwriter: { label: 'Songwriter', type: 'text' },
      royaltyRate: { label: 'Royalty Rate', type: 'number' },
      territory: { label: 'Territory', type: 'text' },
      term: { label: 'License Term', type: 'text' },
    },
  },
  pcg: {
    title: 'Parental Consent and Guarantee (Used with Minors)',
    fields: {
      parentName: { label: 'Parent/Guardian Name', type: 'text' },
      minorName: { label: "Minor's Name", type: 'text' },
      contractTitle: { label: 'Main Contract Title', type: 'text' },
      contractDate: { label: 'Main Contract Date', type: 'date' },
      consentDetails: { label: 'Consent Details', type: 'textarea' },
    },
  },
  pada: {
    title: 'Producer and Artist Development Agreement',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      term: { label: 'Development Term', type: 'text' },
      numberOfTracks: { label: 'Number of Tracks', type: 'number' },
      advanceAmount: { label: 'Advance Amount', type: 'number' },
      royaltyPercentage: { label: 'Royalty Percentage', type: 'number' },
      specialTerms: { label: 'Special Terms', type: 'textarea' },
    },
  },
  papa: {
    title: 'Producer and Artist Production Agreement',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      projectTitle: { label: 'Project Title', type: 'text' },
      numberOfTracks: { label: 'Number of Tracks', type: 'number' },
      advanceAmount: { label: 'Advance Amount', type: 'number' },
      royaltyPercentage: { label: 'Royalty Percentage', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      specialTerms: { label: 'Special Terms', type: 'textarea' },
    },
  },
  ppca: {
    title: 'Producer and Production Company Agreement',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      companyName: { label: 'Production Company Name', type: 'text' },
      term: { label: 'Agreement Term', type: 'text' },
      exclusivityTerms: { label: 'Exclusivity Terms', type: 'textarea' },
      compensationTerms: { label: 'Compensation Terms', type: 'textarea' },
      ownershipTerms: { label: 'Ownership Terms', type: 'textarea' },
    },
  },
  prcpa: {
    title: 'Producer and Record Company Production Agreement',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      recordCompanyName: { label: 'Record Company Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      projectTitle: { label: 'Project Title', type: 'text' },
      numberOfTracks: { label: 'Number of Tracks', type: 'number' },
      advanceAmount: { label: 'Advance Amount', type: 'number' },
      royaltyPercentage: { label: 'Royalty Percentage', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
    },
  },
  pd: {
    title: 'Producer Declaration',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      recordingDate: { label: 'Recording Date', type: 'date' },
      ownershipDeclaration: {
        label: 'Ownership Declaration',
        type: 'textarea',
      },
      rightsGranted: { label: 'Rights Granted', type: 'textarea' },
    },
  },
  pt1a: {
    title: 'Producer of Tracks 1-Artist (No Royalty/Song Rights)',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      compensationAmount: { label: 'Compensation Amount', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  pt2a: {
    title: 'Producer of Tracks 2-Artist (No Royalty/No Song Rights)',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      compensationAmount: { label: 'Compensation Amount', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  pt3a: {
    title: 'Producer of Tracks 3-Artist (Royalty/Song Rights)',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      advanceAmount: { label: 'Advance Amount', type: 'number' },
      royaltyPercentage: { label: 'Royalty Percentage', type: 'number' },
      songwritingShare: { label: 'Songwriting Share (%)', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  pt4a: {
    title: 'Producer of Tracks 4-Artist (Royalty/No Song Rights)',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      advanceAmount: { label: 'Advance Amount', type: 'number' },
      royaltyPercentage: { label: 'Royalty Percentage', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  pt1l: {
    title: 'Producer of Tracks 1-Label (No Royalty/Song Rights)',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      labelName: { label: 'Label Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      compensationAmount: { label: 'Compensation Amount', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  pt2l: {
    title: 'Producer of Tracks 2-Label (No Royalty/No Song Rights)',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      labelName: { label: 'Label Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      compensationAmount: { label: 'Compensation Amount', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  pt3l: {
    title: 'Producer of Tracks 3-Label (Royalty/Song Rights)',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      labelName: { label: 'Label Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      advanceAmount: { label: 'Advance Amount', type: 'number' },
      royaltyPercentage: { label: 'Royalty Percentage', type: 'number' },
      songwritingShare: { label: 'Songwriting Share (%)', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  pt4l: {
    title: 'Producer of Tracks 4-Label (Royalty/No Song Rights)',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      labelName: { label: 'Label Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      advanceAmount: { label: 'Advance Amount', type: 'number' },
      royaltyPercentage: { label: 'Royalty Percentage', type: 'number' },
      deliveryDate: { label: 'Delivery Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
  ptla: {
    title: 'Producer of Tracks License Agreement (Non-Exclusive)',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      licenseeName: { label: 'Licensee Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      licenseeFee: { label: 'License Fee', type: 'number' },
      term: { label: 'License Term', type: 'text' },
      territory: { label: 'Territory', type: 'text' },
      usageRights: { label: 'Usage Rights', type: 'textarea' },
    },
  },
  rea: {
    title: 'Recording Engineer Agreement',
    fields: {
      engineerName: { label: 'Engineer Name', type: 'text' },
      clientName: { label: 'Client Name', type: 'text' },
      projectTitle: { label: 'Project Title', type: 'text' },
      startDate: { label: 'Start Date', type: 'date' },
      endDate: { label: 'End Date', type: 'date' },
      compensationRate: { label: 'Compensation Rate', type: 'number' },
      specialTerms: { label: 'Special Terms', type: 'textarea' },
    },
  },
  rsra: {
    title: 'Recording Studio Rental Agreement',
    fields: {
      studioName: { label: 'Studio Name', type: 'text' },
      clientName: { label: 'Client Name', type: 'text' },
      startDate: { label: 'Start Date', type: 'date' },
      endDate: { label: 'End Date', type: 'date' },
      rentalRate: { label: 'Rental Rate', type: 'number' },
      equipmentIncluded: { label: 'Equipment Included', type: 'textarea' },
      specialTerms: { label: 'Special Terms', type: 'textarea' },
    },
  },
  rpa: {
    title: 'Release From Production Agreement',
    fields: {
      producerName: { label: 'Producer Name', type: 'text' },
      artistName: { label: 'Artist Name', type: 'text' },
      originalAgreementDate: { label: 'Original Agreement Date', type: 'date' },
      releaseDate: { label: 'Release Date', type: 'date' },
      termsOfRelease: { label: 'Terms of Release', type: 'textarea' },
    },
  },
  saa: {
    title: 'Side Artist Agreement (No Royalty/No Song Rights)',
    fields: {
      sideArtistName: { label: 'Side Artist Name', type: 'text' },
      mainArtistName: { label: 'Main Artist Name', type: 'text' },
      trackTitle: { label: 'Track Title', type: 'text' },
      compensationAmount: { label: 'Compensation Amount', type: 'number' },
      recordingDate: { label: 'Recording Date', type: 'date' },
      creditLine: { label: 'Credit Line', type: 'text' },
    },
  },
};

export function ContractForm({ contractId, onSubmit }: ContractFormProps) {
  const { formData, handleInputChange, resetForm } = useContractForm({});
  const { toast } = useToast();

  const contractForm = contractForms[contractId];

  if (!contractForm) {
    return <div>Contract type not found</div>;
  }

  const renderField = (key: string, field: FieldConfig) => {
    const commonProps = {
      id: key,
      value: formData[key] || '',
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleInputChange(key, e.target.value),
      className: 'mt-1',
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea {...commonProps} />;
      case 'number':
        return <Input {...commonProps} type="number" />;
      case 'date':
        return <Input {...commonProps} type="date" />;
      default:
        return <Input {...commonProps} type="text' />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).some((value) => value.trim() === '')) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Form submitted:', formData);
      toast({
        title: 'Form Submitted',
        description: 'The form data has been logged.',
      });
    }
    // Reset form after submission
    resetForm();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-800">
        {contractForm.title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.entries(contractForm.fields).map(([key, field]) => (
          <div key={key}>
            <Label htmlFor={key}>{field.label}</Label>
            {renderField(key, field)}
          </div>
        ))}
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          Generate Contract
        </Button>
      </form>
    </motion.div>
  );
}
